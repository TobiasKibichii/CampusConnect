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
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Dropzone from "react-dropzone";
import UserImage from "components/UserImage";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
import axios from "axios";

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
  const [bookedSlots, setBookedSlots] = useState([]); // New state for booked slots
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

  // When both a date and a venue are selected, fetch the booked slots for that venue on that day
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (selectedVenue && eventDate) {
        try {
          const response = await axios.get(
            `http://localhost:6001/venues/${selectedVenue._id}/bookings`,
            {
              params: { date: eventDate },
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // Assuming the endpoint returns an array of booked slots
          setBookedSlots(response.data);
        } catch (error) {
          console.error("Error fetching booked slots:", error);
        }
      } else {
        setBookedSlots([]);
      }
    };
    fetchBookedSlots();
  }, [selectedVenue, eventDate, token]);

  const handlePost = async () => {
    const formData = new FormData();
    formData.append("userId", _id);
    formData.append("description", post);
    formData.append("type", postType);

    if (postType === "event") {
      formData.append("eventDate", eventDate);
      // Combine eventDate with time strings to create full ISO date strings.
      const eventFromDate = new Date(`${eventDate}T${eventTimeFrom}:00`);
      const eventToDate = new Date(`${eventDate}T${eventTimeTo}:00`);
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
    setBookedSlots([]);
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
          {/* Show booked slots for the selected venue on the chosen date */}
          {selectedVenue && eventDate && bookedSlots.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle1" color="textSecondary">
                Booked Slots for {selectedVenue.name} on {eventDate}:
              </Typography>
              <List>
                {bookedSlots.map((slot, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${new Date(
                        slot.eventTimeFrom
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} - ${new Date(slot.eventTimeTo).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      )}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
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
