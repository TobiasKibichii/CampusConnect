import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Divider,
  TextField,
  Button,
} from "@mui/material";
import { useSelector } from "react-redux";
import SummaryCard from "./summaryCard.jsx"; // adjust path if needed


const PostDetails = () => {
  const { postId } = useParams(); // Expecting a postId from the URL
  const token = useSelector((state) => state.token);
  const currentUserId = useSelector((state) => state.user._id);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // States for editable fields
  const [editDescription, setEditDescription] = useState("");
  const [editAbout, setEditAbout] = useState("");
  const [editWhatYoullLearn, setEditWhatYoullLearn] = useState("");
  const [editEventDate, setEditEventDate] = useState("");
  const [editEventTimeFrom, setEditEventTimeFrom] = useState("");
  const [editEventTimeTo, setEditEventTimeTo] = useState("");
  const [editLocation, setEditLocation] = useState("");

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await fetch(`http://localhost:6001/events/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        console.log(data.picturePath + "uuuuuuu");
        setPost(data);
        // Set initial values for edit mode
        setEditDescription(data.description || "");
        if (data.type === "event") {
          setEditAbout(data.about || "");
          setEditWhatYoullLearn(data.whatYoullLearn || "");
          setEditEventDate(
            data.eventDate
              ? new Date(data.eventDate).toISOString().substring(0, 10)
              : ""
          );
          setEditEventTimeFrom(
            data.eventTimeFrom
              ? new Date(data.eventTimeFrom).toISOString().substring(11, 16)
              : ""
          );
          setEditEventTimeTo(
            data.eventTimeTo
              ? new Date(data.eventTimeTo).toISOString().substring(11, 16)
              : ""
          );
          setEditLocation(data.location || "");
        }
      } catch (error) {
        console.error("Error fetching post details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetails();
  }, [postId, token]);

  const handleSave = async () => {
    // Build updated post object depending on type
    let updatedFields = {
      description: editDescription,
    };
    if (post.type === "event") {
      updatedFields = {
        ...updatedFields,
        about: editAbout,
        whatYoullLearn: editWhatYoullLearn,
        eventDate: editEventDate,
        eventTimeFrom: editEventTimeFrom,
        eventTimeTo: editEventTimeTo,
        location: editLocation,
      };
    }
    try {
      const response = await fetch(`http://localhost:6001/events/${postId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFields),
      });
      if (!response.ok) {
        throw new Error("Failed to update post");
      }
      const updatedPost = await response.json();
      setPost(updatedPost);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  if (loading)
    return (
      <CircularProgress sx={{ display: "block", margin: "auto", mt: 4 }} />
    );
  if (!post)
    return (
      <Typography variant="h6" color="error" align="center">
        Post not found
      </Typography>
    );

  return (
    <Box maxWidth={600} mx="auto" mt={4} p={2}>
      <Card>
        {post.picturePath && (
          <CardMedia
            component="img"
            height="200"
            image={`http://localhost:6001/assets/${post.picturePath}`}
            alt={post.description}
          />
        )}
        <CardContent>
          {isEditing ? (
            <>
              {/* Editable description */}
              <TextField
                fullWidth
                variant="outlined"
                label={post.type === "event" ? "Event Title" : "Post Title"}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                sx={{ mb: 2 }}
              />
              {post.type === "event" && (
                <>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="About"
                    value={editAbout}
                    onChange={(e) => setEditAbout(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="What You'll Learn"
                    value={editWhatYoullLearn}
                    onChange={(e) => setEditWhatYoullLearn(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Date"
                    type="date"
                    value={editEventDate}
                    onChange={(e) => setEditEventDate(e.target.value)}
                    sx={{ mb: 2 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Time From"
                    type="time"
                    value={editEventTimeFrom}
                    onChange={(e) => setEditEventTimeFrom(e.target.value)}
                    sx={{ mb: 2 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Time To"
                    type="time"
                    value={editEventTimeTo}
                    onChange={(e) => setEditEventTimeTo(e.target.value)}
                    sx={{ mb: 2 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Location"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                </>
              )}
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button variant="contained" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="outlined" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h4" gutterBottom>
                {/* For events, the event title was stored in description */}
                {post.description}
              </Typography>
              {post.type === "event" ? (
                <>
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    gutterBottom
                  >
                    {post.about}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6">What You'll Learn</Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    {post.whatYoullLearn}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2">
                    <strong>Date:</strong>{" "}
                    {new Date(post.eventDate).toDateString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Time:</strong>{" "}
                    {new Date(post.eventTimeFrom).toLocaleTimeString()} -{" "}
                    {new Date(post.eventTimeTo).toLocaleTimeString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Location:</strong> {post.location}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  {post.description}
                </Typography>
              )}
            </>
          )}
          
        </CardContent>
        {/* Summary appears separately below the card */}
        <Box mt={4}>
          <SummaryCard
            description={post.description}
            about={post.about}
            whatYoullLearn={post.whatYoullLearn}
          />
        </Box>

        {/* Only show the Edit button if the logged in user created the post */}
        {!isEditing && post.userId === currentUserId && (
          <Box sx={{ p: 2, textAlign: "right" }}>
            <Button variant="outlined" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  );
  {
    /* SummaryCard goes here */
  }
  
};

export default PostDetails;
