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
} from "@mui/material";
import { useSelector } from "react-redux";

const PostDetails = () => {
  const { postId } = useParams(); // Expecting a postId from the URL
  const token = useSelector((state) => state.token);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await fetch(`http://localhost:6001/events/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        console.log(data.picturePath+"uuuuuuu")
        setPost(data);
      } catch (error) {
        console.error("Error fetching post details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetails();
  }, [postId, token]);

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
          <Typography variant="h4" gutterBottom>
            {/* For events, the event title was stored in description */}
            {post.description}
          </Typography>
          {post.type === "event" ? (
            <>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                {post.eventAbout}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">What You'll Learn</Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {post.eventLearn}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2">
                <strong>Date:</strong> {new Date(post.eventDate).toDateString()}
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
        </CardContent>
      </Card>
    </Box>
  );
};

export default PostDetails;
