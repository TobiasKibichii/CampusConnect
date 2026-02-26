import React, { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
import PostWidget from "./PostWidget";
import { Box, Pagination } from "@mui/material";

const PostsWidget = ({ userId, isProfile = false, filter }) => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts) || []; // Ensure it's an array
  const token = useSelector((state) => state.token);

  // Fetch posts for a specific user (profile view)
  const getUserPosts = useCallback(async () => {
    try {
      const response = await fetch(
        `https://campusconnect-backend.onrender.com/posts/user/${userId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch user posts");
      const data = await response.json();
      dispatch(setPosts({ posts: data }));
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  }, [dispatch, token, userId]);

  // Fetch all posts (or filtered posts)
  const getPosts = useCallback(async () => {
    let url = "https://campusconnect-backend.onrender.com/posts";
    if (filter === "events") url += "?type=events";
    if (filter === "friends" && userId) url += `?type=friends&userId=${userId}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      dispatch(setPosts({ posts: data }));
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, [dispatch, filter, token, userId]);

  // Fetch posts on component mount or when dependencies change
  useEffect(() => {
    if (isProfile) {
      getUserPosts();
    } else {
      getPosts();
    }
  }, [isProfile, getUserPosts, getPosts, filter]);

  // ---------------- Pagination Logic ----------------
  const postsPerPage = 5;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const indexOfLastPost = page * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  // ----------------------------------------------------

  return (
    <>
      {currentPosts.map(
        ({
          _id,
          userId: postUserId,
          firstName,
          lastName,
          description,
          location,
          picturePath,
          userPicturePath,
          likes,
          comments,
          type,
          eventDate,
          eventLocation,
          attendees,
          createdAt,
        }) => (
          <PostWidget
            key={_id}
            postId={_id}
            postUserId={postUserId}
            name={`${firstName} ${lastName}`}
            description={description}
            location={location}
            picturePath={picturePath}
            userPicturePath={userPicturePath}
            likes={likes}
            comments={comments}
            type={type}
            eventDate={eventDate}
            eventLocation={eventLocation}
            attendees={attendees}
            createdAt={createdAt}
          />
        ),
      )}
      <Box display="flex" justifyContent="center" mt="1rem">
        <Pagination
          count={totalPages}
          page={page}
          onChange={handleChangePage}
          color="primary"
        />
      </Box>
    </>
  );
};

export default PostsWidget;
