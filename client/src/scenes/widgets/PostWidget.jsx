import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
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
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost } from "state";

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
  eventLocation,
  attendees = [],
}) => {
  const [isComments, setIsComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // Track which comment is being replied to
  const [replyText, setReplyText] = useState("");
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;
  const isAttending = attendees.includes(loggedInUserId);

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  // Like Post
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

  // Handle Reply Submission
  const submitReply = async (parentComment) => {
    if (!replyText.trim()) return;

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
          content: `@${parentComment.userName} ${replyText}`,
          parentCommentId: parentComment._id, // Only reply to top-level comments
        }),
      }
    );

    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
    setReplyText("");
    setReplyingTo(null);
  };

  return (
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
      />

      {/* Display event info if it's an event */}
      {type === "event" && (
        <Box display="flex" alignItems="center" gap="0.5rem" mt="0.5rem">
          <EventOutlined sx={{ color: primary }} />
          <Typography color={main}>
            {new Date(eventDate).toLocaleDateString()}
          </Typography>
          <LocationOnOutlined sx={{ color: primary }} />
          <Typography color={main}>{eventLocation}</Typography>
        </Box>
      )}

      <Typography color={main} sx={{ mt: "1rem" }}>
        {description}
      </Typography>

      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={`http://localhost:6001/assets/${picturePath}`}
        />
      )}

      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          {/* Like Button */}
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

          {/* Comment Button */}
          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments.length}</Typography>
          </FlexBetween>
        </FlexBetween>

        <IconButton>
          <ShareOutlined />
        </IconButton>
      </FlexBetween>

      {/* Attend Event Button */}
      {type === "event" && (
        <Box mt="1rem">
          <Button
            variant="contained"
            color={isAttending ? "success" : "primary"}
            startIcon={<EventAvailableOutlined />}
            onClick={toggleAttend}
          >
            {isAttending ? "Attending" : "Attend Event"}
          </Button>
          <Typography sx={{ mt: "0.5rem" }}>
            {attendees.length}{" "}
            {attendees.length === 1 ? "person is" : "people are"} attending.
          </Typography>
        </Box>
      )}

      {/* Comments Section */}
      {isComments && (
        <Box mt="0.5rem">
          {/* Input for new comments */}
          <Box display="flex" alignItems="center" gap="0.5rem">
            <TextField
              fullWidth
              placeholder="Write a comment..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <Button
              variant="contained"
              size="small"
              onClick={() => submitReply({ userName: name, _id: null })} // No parentCommentId for new comments
            >
              Comment
            </Button>
          </Box>

          {/* Display existing comments */}
          {comments?.length > 0 ? (
            comments
              .filter((comment) => !comment.parentCommentId)
              .map((comment) => (
                <Box key={comment._id} mt="0.5rem">
                  <Divider />
                  <Typography sx={{ color: main, m: "0.5rem 0", pl: "1rem" }}>
                    <strong>
                      {comment.userId?.firstName}
                      {comment.userId?.lastName}
                    </strong>
                    : {comment.content}
                  </Typography>

                  {/* Reply Button */}
                  <Button onClick={() => setReplyingTo(comment)} size="small">
                    Reply
                  </Button>

                  {/* Reply Input */}
                  {replyingTo?._id === comment._id && (
                    <Box mt="0.5rem" pl="2rem">
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
                </Box>
              ))
          ) : (
            <Typography sx={{ color: main, pl: "1rem" }}>
              No comments yet.
            </Typography>
          )}

          <Divider />
        </Box>
      )}
    </WidgetWrapper>
  );
};

export default PostWidget;
