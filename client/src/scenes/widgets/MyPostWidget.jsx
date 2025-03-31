import WidgetWrapper from "components/WidgetWrapper";
import {
  EditOutlined,
  DeleteOutlined,
  AttachFileOutlined,
  GifBoxOutlined,
  ImageOutlined,
  MicOutlined,
  MoreHorizOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Typography,
  InputBase,
  useTheme,
  Button,
  IconButton,
  useMediaQuery,
  Select,
  MenuItem,
  TextField,
  Autocomplete,
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Dropzone from "react-dropzone";
import UserImage from "components/UserImage";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";

const MyPostWidget = ({ picturePath }) => {
  const dispatch = useDispatch();
  const [isImage, setIsImage] = useState(false);
  const [image, setImage] = useState(null);
  const [post, setPost] = useState("");
  const [postType, setPostType] = useState("post");
  const [eventDate, setEventDate] = useState("");
  const [eventTimeFrom, setEventTimeFrom] = useState("");
  const [eventTimeTo, setEventTimeTo] = useState("");
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [venues, setVenues] = useState([]);
  const [message, setMessage] = useState("");

  const { palette } = useTheme();
  const { _id, role } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const mediumMain = palette.neutral.mediumMain;
  const medium = palette.neutral.medium;

  // Fetch available venues when postType is "event"
  useEffect(() => {
    if (postType === "event") {
      fetch("http://localhost:6001/venues", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          // data.venues should be an array of venue objects with an "available" flag
          setVenues(data.venues);
        })
        .catch((err) => console.error("Error fetching venues:", err));
    }
  }, [postType, token]);

  const handlePost = async () => {
    const formData = new FormData();
    formData.append("userId", _id);
    formData.append("description", post);
    formData.append("type", postType);

    if (postType === "event") {
      formData.append("eventDate", eventDate);

      // Combine eventDate with time strings to create full ISO date strings.
      // For example, if eventDate is "2025-03-30" and eventTimeFrom is "09:51",
      // then new Date("2025-03-30T09:51:00") creates a proper Date object.
      const eventFromDate = new Date(`${eventDate}T${eventTimeFrom}:00`);
      const eventToDate = new Date(`${eventDate}T${eventTimeTo}:00`);

      // Append as ISO strings so that the backend can correctly cast them to dates.
      formData.append("eventTimeFrom", eventFromDate.toISOString());
      formData.append("eventTimeTo", eventToDate.toISOString());

      // Save the selected venue's ID as the location field.
      formData.append("location", selectedVenue ? selectedVenue._id : "");
    }

    if (image) {
      formData.append("picture", image);
      formData.append("picturePath", image.name);
    }

    // Create post
    const response = await fetch(`http://localhost:6001/posts/p`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const posts = await response.json();
    dispatch(setPosts(posts));

    // If event post, update the venue status on the backend.
    // Ensure you have a corresponding PATCH endpoint at /venues/updateStatus/:venueId.
    if (postType === "event" && selectedVenue) {
      const patchResponse = await fetch(
        `http://localhost:6001/venues/updateStatus/${selectedVenue._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ available: false }),
        }
      );

      if (!patchResponse.ok) {
        console.error("Error updating venue status");
      }
    }

    // Reset form states
    setImage(null);
    setPost("");
    setEventDate("");
    setEventTimeFrom("");
    setEventTimeTo("");
    setSelectedVenue(null);
    setPostType("post");
  };

  return (
    <WidgetWrapper>
      <FlexBetween gap="1.5rem">
        <UserImage image={picturePath} />
        <InputBase
          placeholder="What's on your mind..."
          onChange={(e) => setPost(e.target.value)}
          value={post}
          sx={{
            width: "100%",
            backgroundColor: palette.neutral.light,
            borderRadius: "2rem",
            padding: "1rem 2rem",
          }}
        />
      </FlexBetween>

      {(role === "editor" || role === "admin") && (
        <Select
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
          sx={{ width: "100%", mt: 2 }}
        >
          <MenuItem value="post">Post</MenuItem>
          <MenuItem value="event">Event</MenuItem>
        </Select>
      )}

      {postType === "event" && (
        <Box mt={2}>
          <InputBase
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            sx={{ width: "100%", mb: 1, p: 1, border: `1px solid ${medium}` }}
          />
          <Box display="flex" gap="1rem" mb="1rem">
            <TextField
              type="time"
              label="Start Time"
              value={eventTimeFrom}
              onChange={(e) => setEventTimeFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, border: `1px solid ${medium}` }}
            />
            <TextField
              type="time"
              label="End Time"
              value={eventTimeTo}
              onChange={(e) => setEventTimeTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, border: `1px solid ${medium}` }}
            />
          </Box>
          <Autocomplete
            options={venues}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            onChange={(event, newValue) => {
              setSelectedVenue(newValue);
            }}
            value={selectedVenue}
            renderOption={(props, option) => (
              <li
                {...props}
                style={{
                  backgroundColor: option.available
                    ? palette.success.light
                    : palette.neutral.light,
                  color: option.available ? "inherit" : "gray",
                }}
                disabled={!option.available}
              >
                {option.name} (Capacity: {option.capacity})
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Venue"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </Box>
      )}

      {isImage && (
        <Box
          border={`1px solid ${medium}`}
          borderRadius="5px"
          mt="1rem"
          p="1rem"
        >
          <Dropzone
            acceptedFiles=".jpg,.jpeg,.png"
            multiple={false}
            onDrop={(acceptedFiles) => setImage(acceptedFiles[0])}
          >
            {({ getRootProps, getInputProps }) => (
              <FlexBetween>
                <Box
                  {...getRootProps()}
                  border={`2px dashed ${palette.primary.main}`}
                  p="1rem"
                  width="100%"
                  sx={{ "&:hover": { cursor: "pointer" } }}
                >
                  <input {...getInputProps()} />
                  {!image ? (
                    <p>Add Image Here</p>
                  ) : (
                    <FlexBetween>
                      <Typography>{image.name}</Typography>
                      <EditOutlined />
                    </FlexBetween>
                  )}
                </Box>
                {image && (
                  <IconButton
                    onClick={() => setImage(null)}
                    sx={{ width: "15%" }}
                  >
                    <DeleteOutlined />
                  </IconButton>
                )}
              </FlexBetween>
            )}
          </Dropzone>
        </Box>
      )}

      <Divider sx={{ margin: "1.25rem 0" }} />

      <FlexBetween>
        <FlexBetween gap="0.25rem" onClick={() => setIsImage(!isImage)}>
          <ImageOutlined sx={{ color: mediumMain }} />
          <Typography
            color={mediumMain}
            sx={{ "&:hover": { cursor: "pointer", color: medium } }}
          >
            Image
          </Typography>
        </FlexBetween>

        {isNonMobileScreens ? (
          <>
            <FlexBetween gap="0.25rem">
              <GifBoxOutlined sx={{ color: mediumMain }} />
              <Typography color={mediumMain}>Clip</Typography>
            </FlexBetween>
            <FlexBetween gap="0.25rem">
              <AttachFileOutlined sx={{ color: mediumMain }} />
              <Typography color={mediumMain}>Attachment</Typography>
            </FlexBetween>
            <FlexBetween gap="0.25rem">
              <MicOutlined sx={{ color: mediumMain }} />
              <Typography color={mediumMain}>Audio</Typography>
            </FlexBetween>
          </>
        ) : (
          <FlexBetween gap="0.25rem">
            <MoreHorizOutlined sx={{ color: mediumMain }} />
          </FlexBetween>
        )}

        <Button
          disabled={!post}
          onClick={handlePost}
          sx={{
            color: palette.background.alt,
            backgroundColor: palette.primary.main,
            borderRadius: "3rem",
          }}
        >
          {postType === "event" ? "CREATE EVENT" : "POST"}
        </Button>
      </FlexBetween>
    </WidgetWrapper>
  );
};

export default MyPostWidget;
