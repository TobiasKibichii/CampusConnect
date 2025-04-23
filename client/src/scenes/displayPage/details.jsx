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
  IconButton,
} from "@mui/material";
import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  BookmarkBorderOutlined,
  BookmarkOutlined,
  EventAvailableOutlined,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import SummaryCard from "./summaryCard.jsx"; // adjust path if needed
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import axios from "axios";
import { updateSavedPosts } from "state";

const PostDetails = () => {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const currentUserId = useSelector((state) => state.user._id);
  const savedPosts = useSelector((state) => state.user.savedPosts) || [];

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields states
  const [editDescription, setEditDescription] = useState("");
  const [editAbout, setEditAbout] = useState("");
  const [editWhatYoullLearn, setEditWhatYoullLearn] = useState("");
  const [editEventDate, setEditEventDate] = useState("");
  const [editEventTimeFrom, setEditEventTimeFrom] = useState("");
  const [editEventTimeTo, setEditEventTimeTo] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [eventData, setEventData] = useState(null);

  // New states for widget functionality
  const [isComments, setIsComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  
  // Helper to strip HTML
  const stripHtml = (text) => text.replace(/<[^>]+>/g, "");

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await fetch(`http://localhost:6001/events/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setPost(data);
        console.log(data)

        // initialize editing fields
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

        // initialize widget states
        setIsLiked(Boolean(data.likes?.[currentUserId]));
        setLikeCount(Object.keys(data.likes || {}).length);
        setIsSaved(savedPosts.map(String).includes(postId));
        setIsAttending(data.attendees?.includes(currentUserId));
      } catch (error) {
        console.error("Error fetching post details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId, token, currentUserId, savedPosts]);

  
    useEffect(() => {
      const fetchEventData = async () => {
        try {
          const response = await axios.get(
            `http://localhost:6001/posts/venueCapacity/${postId}`
          );
          console.log("kkk" + response.data)
          setEventData(response.data); // The event data includes the populated venue
        } catch (error) {
          console.error("Error fetching event data:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchEventData();
    }, [postId]);
  
  
    if (!eventData) {
      return <div>Event not found</div>;
    }
  
    // Access event data and venue capacity
    const { venueId } = eventData;
    const venueCapacity = venueId ? venueId.capacity : 0;

  const handleSavePost = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:6001/save/${postId}`,
        { userId: currentUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(updateSavedPosts(response.data.savedPosts));
      setIsSaved(!isSaved);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:6001/posts/${postId}/like`,
        { userId: currentUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLikeCount(response.data.likesCount);
      setIsLiked(!isLiked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAttend = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:6001/posts/${postId}/attend`,
        { userId: currentUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsAttending(!isAttending);
      setPost(response.data);

    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdits = async () => {
    let updatedFields = { description: editDescription };
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
        {/* Profile header */}
        <Box p={2}>
          <Friend
            friendId={post.userId}
            name={`${post.firstName} ${post.lastName}`}
            subtitle={post.location}
            userPicturePath={post.userPicturePath}
          />
        </Box>

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
              {" "}
              {/* Editing form */}
              <TextField
                fullWidth
                multiline
                minRows={6}
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
                <Button variant="contained" onClick={handleSaveEdits}>
                  Save
                </Button>
                <Button variant="outlined" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </Box>
            </>
          ) : (
            <>
              {" "}
              {/* View mode */}
              {post.type === "event" ? (
                <>
                  {" "}
                  {/* Event details */}
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    gutterBottom
                    dangerouslySetInnerHTML={{ __html: post.about }}
                  />
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6">What You'll Learn</Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                    dangerouslySetInnerHTML={{ __html: post.whatYoullLearn }}
                  />
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
                <Typography
                  variant="h4"
                  gutterBottom
                  dangerouslySetInnerHTML={{ __html: post.description }}
                />
              )}
            </>
          )}
        </CardContent>

        {/* Widget toolbar */}
        {!isEditing && (
          <Box sx={{ p: 2 }}>
            <FlexBetween>
              <FlexBetween gap="1rem">
                <FlexBetween gap="0.3rem">
                  <IconButton onClick={handleLike}>
                    {isLiked ? (
                      <FavoriteOutlined />
                    ) : (
                      <FavoriteBorderOutlined />
                    )}
                  </IconButton>
                  <Typography>{likeCount}</Typography>
                </FlexBetween>
                <FlexBetween gap="0.3rem">
                  <IconButton onClick={() => setIsComments(!isComments)}>
                    <ChatBubbleOutlineOutlined />
                  </IconButton>
                  <Typography>{post.comments?.length || 0}</Typography>
                </FlexBetween>
                {post.type === "event" && (
                  <>
                    <Button
                      variant="contained"
                      color={isAttending ? "success" : "primary"}
                      startIcon={<EventAvailableOutlined />}
                      onClick={handleAttend}
                      disabled={
                        !isAttending && post.attendees.length >= venueCapacity
                      }
                    >
                      {!isAttending && post.attendees.length >= venueCapacity
                        ? "Event Full"
                        : isAttending
                        ? "Attending"
                        : "Attend Event"}
                    </Button>
                    <Typography variant="caption">
                      {post.attendees.length} / {venueCapacity} Attending
                    </Typography>
                  </>
                )}
              </FlexBetween>
              <IconButton onClick={handleSavePost}>
                {isSaved ? <BookmarkOutlined /> : <BookmarkBorderOutlined />}
              </IconButton>
            </FlexBetween>
          </Box>
        )}

        {/* Edit button */}
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
};

export default PostDetails;
