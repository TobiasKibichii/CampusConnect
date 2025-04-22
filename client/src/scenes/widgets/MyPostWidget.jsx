import WidgetWrapper from "components/WidgetWrapper";
import {
  EditOutlined,
  DeleteOutlined,
  ImageOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Typography,
  useTheme,
  Button,
  IconButton,
  InputBase,
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
import { useNavigate } from "react-router-dom";

// Import ReactQuill and its styles
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const MyPostWidget = ({ picturePath }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isImage, setIsImage] = useState(false);
  const [image, setImage] = useState(null);
  // We now only use 'post' as description for regular posts.
  const [post, setPost] = useState("");
  const [postType, setPostType] = useState("post");

  // New states for event extra fields
  const [eventTitle, setEventTitle] = useState("");
  const [eventAbout, setEventAbout] = useState("");
  const [eventLearn, setEventLearn] = useState("");

  const [eventDate, setEventDate] = useState("");
  const [eventTimeFrom, setEventTimeFrom] = useState("");
  const [eventTimeTo, setEventTimeTo] = useState("");
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [venues, setVenues] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
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
    formData.append("type", postType);

    // For posts, use the 'post' state as description.
    // For events, use eventTitle as the description (title replaces description)
    if (postType === "post") {
      formData.append("description", post);
    } else if (postType === "event") {
      formData.append("description", eventTitle);
      // Append extra event fields
      formData.append("about", eventAbout);
      formData.append("whatYoullLearn", eventLearn);
      formData.append("eventDate", eventDate);
      // Combine eventDate with time strings to create full ISO date strings.
      const eventFromDate = new Date(`${eventDate}T${eventTimeFrom}:00`);
      const eventToDate = new Date(`${eventDate}T${eventTimeTo}:00`);
      formData.append("eventTimeFrom", eventFromDate);
      formData.append("eventTimeTo", eventToDate);
      console.log("iiiiiiiiii" + eventFromDate)
      console.log("iiiiiiiiii" + eventToDate)
      // Save the selected venue's ID as the location field.
      formData.append("location", selectedVenue ? selectedVenue._id : "");
    }

    if (image) {
      formData.append("picture", image); // <--- This is what the server expects to receive as the file
      formData.append("picturePath", image.name);
    }

    // Create post/event
    const response = await fetch(`http://localhost:6001/posts/p`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const posts = await response.json();
    dispatch(setPosts(posts));

   
    // Reset form states
    setImage(null);
    setPost("");
    setEventTitle("");
    setEventAbout("");
    setEventLearn("");
    setEventDate("");
    setEventTimeFrom("");
    setEventTimeTo("");
    setSelectedVenue(null);
    setBookedSlots([]);
    setPostType("post");
    setIsImage(false);
  };

  return (
    <WidgetWrapper>
      {/* Render the post input using ReactQuill if postType is "post" */}
      {postType === "post" && (
        <FlexBetween gap="1.5rem">
          <UserImage image={picturePath} />
          <Box
            sx={{
              width: "100%",
              backgroundColor: palette.neutral.light,
              borderRadius: "2rem",
              padding: "1rem 2rem",
            }}
          >
            <ReactQuill
              placeholder="What's on your mind..."
              value={post}
              onChange={setPost}
              theme="snow"
            />
          </Box>
        </FlexBetween>
      )}

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

      {/* When creating an event, display the extra event fields */}
      {postType === "event" && (
        <Box mt={2}>
          <TextField
            label="Title"
            placeholder="Event Title"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            inputProps={{ maxLength: 100 }}
            fullWidth
            variant="outlined"
            sx={{ mb: 1 }}
          />
          <TextField
            label="About"
            placeholder="About the event"
            value={eventAbout}
            onChange={(e) => setEventAbout(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ mb: 1 }}
            multiline
            rows={3}
          />
          {/* Replace the "What You'll Learn" TextField with ReactQuill */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              sx={{ mb: 1 }}
            >
              What You'll Learn
            </Typography>
            <ReactQuill
              value={eventLearn}
              onChange={setEventLearn}
              placeholder="What you'll learn"
              theme="snow"
            />
          </Box>
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
              onChange={(e) => {
                const [hours] = e.target.value.split(":");
                setEventTimeFrom(`${hours}:00`);
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, border: `1px solid ${medium}` }}
            />
            <Select
              value={eventTimeTo}
              onChange={(e) => setEventTimeTo(e.target.value)}
              displayEmpty
              sx={{ flex: 1, border: `1px solid ${medium}` }}
            >
              <MenuItem value="">Select Duration</MenuItem>
              {eventTimeFrom &&
                [1, 2, 3].map((hours) => {
                  const [startHour] = eventTimeFrom.split(":").map(Number);
                  const endHour = (startHour + hours) % 24;

                  // Ensure two-digit format (e.g., "09" instead of "9")
                  const formattedHour = String(endHour).padStart(2, "0");

                  return (
                    <MenuItem key={hours} value={`${formattedHour}:00`}>
                      {hours} Hour{hours > 1 ? "s" : ""}
                    </MenuItem>
                  );
                })}
            </Select>
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
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      )}

      <FlexBetween gap="0.5rem" mt="1rem">
        <IconButton onClick={() => setIsImage(!isImage)}>
          <ImageOutlined />
        </IconButton>
        <Typography>{isImage ? "Remove Image" : "Add an Image"}</Typography>
      </FlexBetween>

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
        <Button
          disabled={postType === "post" ? !post : !eventTitle}
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
