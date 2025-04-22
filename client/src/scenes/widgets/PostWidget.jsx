import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  BookmarkBorderOutlined,
  BookmarkOutlined,
  EventOutlined,
  LocationOnOutlined,
  EventAvailableOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  Typography,
  useTheme,
  Button,
  TextField,
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import ReplyIcon from "@mui/icons-material/Reply";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost, updateSavedPosts } from "state";

// Helper function to format time ago
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diff = now - past; // in milliseconds
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments,
  type,
  eventDate,
  attendees = [],
  createdAt,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [fetchedComments, setFetchedComments] = useState([]);
  const [expandedComment, setExpandedComment] = useState({});
  const [clikes, setCLikes] = useState({});
  const [likedComments, setLikedComments] = useState({});
  const [showFullDescription, setShowFullDescription] = useState(false);
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const savedPosts = useSelector((state) => state.user.savedPosts) || [];
  const isSaved = savedPosts
    .map((id) => id.toString())
    .includes(postId.toString());

  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;
  const isAttending = attendees.includes(loggedInUserId);

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  

  // Fetch comments from backend
  const fetchComments = async () => {
    try {
      const response = await fetch(
        `http://localhost:6001/posts/${postId}/comments`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      setFetchedComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, token]);

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

  // Like Post/Event
  const patchLike = async () => {
    const response = await fetch(`http://localhost:6001/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };

  // Attend Event
  const toggleAttend = async () => {
    const response = await fetch(
      `http://localhost:6001/posts/${postId}/attend`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: loggedInUserId }),
      }
    );
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };

  // Toggle Save Post/Event
  const patchSave = async () => {
    try {
      const response = await fetch(`http://localhost:6001/save/${postId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: loggedInUserId }),
      });
      const data = await response.json();
      dispatch(updateSavedPosts(data.savedPosts));
    } catch (error) {
      console.error("Error toggling saved status:", error);
    }
  };

  // Submit a reply (for both top-level and nested replies)
  const submitReply = async (parentComment) => {
    if (!replyText.trim()) return;
    try {
      const response = await fetch(
        `http://localhost:6001/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: loggedInUserId,
            content: `@${parentComment.userId.firstName} ${replyText}`,
            parentCommentId: parentComment._id,
          }),
        }
      );
      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));
      setReplyText("");
      setReplyingTo(null);
      fetchComments();
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  // Submit a new top-level comment
  const submitNewComment = async () => {
    if (!newCommentText.trim()) return;
    try {
      const response = await fetch(
        `http://localhost:6001/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: loggedInUserId,
            content: newCommentText,
            parentCommentId: null,
          }),
        }
      );
      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));
      setNewCommentText("");
      fetchComments();
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  // Update (edit) a comment or reply
  const updateComment = async (commentId) => {
    if (!editingText.trim()) return;
    try {
      const response = await fetch(
        `http://localhost:6001/posts/${postId}/comments/${commentId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: editingText }),
        }
      );
      if (!response.ok) throw new Error("Failed to update comment");
      fetchComments();
      setEditingCommentId(null);
      setEditingText("");
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  // Delete a comment or reply
  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(
        `http://localhost:6001/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete comment");
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Toggle expansion of replies (for a comment)
  const toggleCommentExpansion = (commentId) => {
    setExpandedComment((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Handle likes on a comment/reply
  const toggleLike = async (commentId) => {
    try {
      const response = await axios.patch(
        `http://localhost:6001/comments/${commentId}/like`,
        { userId: loggedInUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedLikes = response.data.likes;
      setLikedComments((prev) => ({
        ...prev,
        [commentId]: !prev[commentId],
      }));
      setCLikes((prev) => ({
        ...prev,
        [commentId]: updatedLikes,
      }));
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    await fetch(`http://localhost:6001/posts/postDelete/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    // re‑fetch feed
    const res = await fetch("http://localhost:6001/posts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const allPosts = await res.json();
    dispatch(setPost(allPosts));
  };

  // Recursive function to render a comment and its nested replies
  const renderComment = (comment, level = 0) => {
    const profileUrl = comment.userId?.picturePath
      ? `http://localhost:6001/assets/${comment.userId.picturePath}`
      : "/defaultAvatar.png";

    return (
      <Box key={comment._id} ml={`${level * 2}rem`} mt="0.5rem">
        <Divider />
        <Box display="flex" alignItems="center" gap="0.5rem">
          <Avatar src={profileUrl} alt={comment.userId?.firstName} />
          <Box flex={1}>
            {editingCommentId === comment._id ? (
              <TextField
                fullWidth
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
              />
            ) : (
              <>
                <Typography
                  sx={{ fontWeight: "bold", color: main, cursor: "pointer" }}
                  component={Link}
                  to={`/profile/${comment.userId?._id}`}
                  style={{ textDecoration: "none", color: main }}
                >
                  {comment.userId?.firstName} {comment.userId?.lastName}
                </Typography>
                <Typography>{comment.content}</Typography>
                <Typography variant="caption" color={main}>
                  {formatTimeAgo(comment.createdAt)}
                </Typography>
              </>
            )}
          </Box>
          {editingCommentId === comment._id ? (
            <>
              <Button onClick={() => updateComment(comment._id)} size="small">
                Save
              </Button>
              <Button
                onClick={() => {
                  setEditingCommentId(null);
                  setEditingText("");
                }}
                size="small"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <IconButton onClick={() => toggleLike(comment._id)} size="small">
                <ThumbUpIcon
                  color={
                    (clikes[comment._id] ?? (comment.likes?.length || 0)) > 0
                      ? "primary"
                      : "inherit"
                  }
                />
              </IconButton>
              <Typography>
                {clikes[comment._id] ??
                  (comment.likes ? comment.likes.length : 0)}
              </Typography>
              <Button
                onClick={() => {
                  if (replyingTo?._id === comment._id) {
                    setReplyingTo(null);
                    setReplyText("");
                  } else {
                    setReplyingTo(comment);
                    setReplyText(`@${comment.userId.firstName} `);
                  }
                }}
                size="small"
              >
                <ReplyIcon fontSize="small" />
              </Button>
              {loggedInUserId === comment.userId?._id && (
                <>
                  <Button
                    onClick={() => {
                      setEditingCommentId(comment._id);
                      setEditingText(comment.content);
                    }}
                    size="small"
                  >
                    <EditOutlined fontSize="small" />
                  </Button>
                  <Button
                    onClick={() => deleteComment(comment._id)}
                    size="small"
                  >
                    <DeleteOutlineOutlined fontSize="small" />
                  </Button>
                </>
              )}
            </>
          )}
        </Box>
        {level === 0 && comment.replies && comment.replies.length > 0 && (
          <Box display="flex" alignItems="center" ml="2rem" mt="0.5rem">
            <IconButton
              onClick={() => toggleCommentExpansion(comment._id)}
              size="small"
            >
              <ArrowDropDownIcon
                sx={{
                  transform: expandedComment[comment._id]
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.3s",
                }}
              />
            </IconButton>
            <Typography variant="caption">
              {comment.replies.length}{" "}
              {comment.replies.length === 1 ? "reply" : "replies"}
            </Typography>
          </Box>
        )}
        {replyingTo?._id === comment._id && (
          <Box mt="0.5rem" ml="2rem">
            <TextField
              fullWidth
              placeholder={`Reply to @${comment.userId?.firstName}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <Button onClick={() => submitReply(comment)} size="small">
              Send
            </Button>
          </Box>
        )}
        {expandedComment[comment._id] &&
          comment.replies &&
          comment.replies.map((reply) => renderComment(reply, level + 1))}
      </Box>
    );
  };

  // Render for event posts vs. normal posts
  if (type === "event") {
    // For events, we now include the profile info similar to posts, then the event card with event details,
    // and finally a toolbar with Like, Comment, Attend, capacity/attendees info, and Bookmark icons.
    return (
      <WidgetWrapper m="2rem 0">
        {/* Profile section */}
        {
          <Friend
            friendId={postUserId}
            name={name}
            subtitle={location}
            userPicturePath={userPicturePath}
          />
        }
        <Box
          sx={{
            border: "1px solid red",
            p: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" color="primary">
            Posted on {new Date(createdAt).toLocaleString()}
          </Typography>

          {loggedInUserId === postUserId._id && ( // Check if the logged-in user is the creator
            <Button
              onClick={handleDelete}
              variant="outlined"
              sx={{
                color: palette.neutral.dark,
                borderColor: palette.neutral.dark,
                backgroundColor: "white",
                minWidth: "36px",
                padding: "6px",
                display: "inline-flex", // Ensure button is displayed as inline-flex
                visibility: "visible", // Ensure button is not hidden
                opacity: 1, // Ensure button is visible
              }}
            >
              <DeleteOutlineOutlined />
            </Button>
          )}
        </Box>

        <Link
          to={`/events/${postId}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Box sx={{ cursor: "pointer", mt: "0.5rem" }}>
            {/* Resized event image */}
            {picturePath && (
              <Box
                component="img"
                src={`http://localhost:6001/assets/${picturePath}`}
                alt={`http://localhost:6001/assets/${picturePath}`}
                sx={{
                  width: "100%",
                  maxHeight: "150px",
                  objectFit: "cover",
                  borderRadius: "0.75rem",
                }}
              />
            )}

            {/* Event details: event name, venue and date */}
            <Box mt="0.5rem" p="0.5rem">
              <Typography variant="h6" color={main}>
                {description}
              </Typography>
              <Box display="flex" alignItems="center" mt="0.25rem">
                <LocationOnOutlined sx={{ color: primary, mr: "0.25rem" }} />
                <Typography color={main}>{location}</Typography>
              </Box>
              <Box display="flex" alignItems="center" mt="0.25rem">
                <EventOutlined sx={{ color: primary, mr: "0.25rem" }} />
                <Typography color={main}>
                  {new Date(eventDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Link>
        {/* Toolbar for events */}
        <FlexBetween mt="0.25rem">
          <FlexBetween gap="1rem">
            <FlexBetween gap="0.3rem">
              <IconButton onClick={patchLike}>
                {isLiked ? (
                  <FavoriteOutlined sx={{ color: primary }} />
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
              <Typography>{fetchedComments.length}</Typography>
            </FlexBetween>
            <Button
              variant="contained"
              color={isAttending ? "success" : "primary"}
              startIcon={<EventAvailableOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                // If event is full and user is not attending, do nothing.
                if (!isAttending && attendees.length >= venueCapacity) return;
                toggleAttend();
              }}
              disabled={!isAttending && attendees.length >= venueCapacity}
            >
              {!isAttending && attendees.length >= venueCapacity
                ? "Event Full"
                : isAttending
                ? "Attending"
                : "Attend Event"}
            </Button>
            {/* Capacity/attendees info placed between Attend and Bookmark */}
            <Typography variant="caption" color={main}>
              {attendees.length} / {venueCapacity} Attending
            </Typography>
          </FlexBetween>
          <IconButton onClick={patchSave}>
            {isSaved ? (
              <BookmarkOutlined sx={{ color: primary }} />
            ) : (
              <BookmarkBorderOutlined />
            )}
          </IconButton>
        </FlexBetween>
        {isComments && (
          <Box mt="1rem">
            <TextField
              fullWidth
              placeholder="Add a comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
            />
            <Button onClick={submitNewComment} size="small">
              Send
            </Button>
          </Box>
        )}
        {isComments && fetchedComments?.length > 0 ? (
          fetchedComments
            .filter((comment) => !comment.parentCommentId)
            .map((comment) => renderComment(comment))
        ) : isComments ? (
          <Typography sx={{ color: main, pl: "1rem" }}>
            No comments yet.
          </Typography>
        ) : null}
      </WidgetWrapper>
    );
  }

  // Normal post rendering
  return (
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
      />

      <Box
        sx={{
          border: "1px solid red",
          p: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="body2" color="primary">
          Posted on {new Date(createdAt).toLocaleString()}
        </Typography>
        {loggedInUserId === postUserId._id && ( // Check if the logged-in user is the creator
          <Button
            onClick={handleDelete}
            variant="outlined"
            sx={{
              color: palette.neutral.dark,
              borderColor: palette.neutral.dark,
              backgroundColor: "white",
              minWidth: "36px",
              padding: "6px",
              display: "inline-flex", // Ensure button is displayed as inline-flex
              visibility: "visible", // Ensure button is not hidden
              opacity: 1, // Ensure button is visible
            }}
          >
            <DeleteOutlineOutlined />
          </Button>
        )}
      </Box>

      <Typography
        color={main}
        sx={{ mt: "1rem" }}
        component="div"
        dangerouslySetInnerHTML={{
          __html: showFullDescription
            ? description
            : description.split(" ").slice(0, 10).join(" ") + "...",
        }}
      />
      {description.split(" ").length > 10 && (
        <Button
          onClick={() => setShowFullDescription(!showFullDescription)}
          size="small"
          sx={{ textTransform: "none", mt: "0.25rem", color: primary }}
        >
          {showFullDescription ? "Show Less" : "Show More"}
        </Button>
      )}

      {picturePath && (
        <img
          src={`http://localhost:6001/assets/${picturePath}`}
          alt="post"
          style={{
            width: "100%",
            maxHeight: "300px",
            objectFit: "cover",
            borderRadius: "0.75rem",
            marginTop: "0.75rem",
          }}
          onClick={() => {
            navigate(`/events/${postId}`);
          }}
        />
      )}
      {createdAt && (
        <Typography variant="caption" color={main} sx={{ mt: "0.5rem" }}>
          {formatTimeAgo(createdAt)}
        </Typography>
      )}
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
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
            <Typography>{fetchedComments.length}</Typography>
          </FlexBetween>
        </FlexBetween>
        <IconButton onClick={patchSave}>
          {isSaved ? (
            <BookmarkOutlined sx={{ color: primary }} />
          ) : (
            <BookmarkBorderOutlined />
          )}
        </IconButton>
      </FlexBetween>
      {isComments && (
        <Box mt="1rem">
          <TextField
            fullWidth
            placeholder="Add a comment..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
          />
          <Button onClick={submitNewComment} size="small">
            Send
          </Button>
        </Box>
      )}
      {isComments && fetchedComments?.length > 0 ? (
        fetchedComments
          .filter((comment) => !comment.parentCommentId)
          .map((comment) => renderComment(comment))
      ) : isComments ? (
        <Typography sx={{ color: main, pl: "1rem" }}>
          No comments yet.
        </Typography>
      ) : null}
    </WidgetWrapper>
  );
};

export default PostWidget;
