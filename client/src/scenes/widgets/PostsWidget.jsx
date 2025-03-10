import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
import PostWidget from "./PostWidget";

const PostsWidget = ({ userId, isProfile = false, filter }) => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts) || []; // Ensure it's an array
  const token = useSelector((state) => state.token);
  console.log(filter)
  
  const getUserPosts = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:6001/posts/user/${userId}`, // Adjust if needed
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch user posts");

      const data = await response.json();
      dispatch(setPosts({ posts: data }));
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  }, [dispatch, token, userId]);

  
  const getPosts = useCallback(async () => {
    let url = "http://localhost:6001/posts";

    if (filter === "events") url += "?type=events";
    if (filter === "friends" && userId) url += `?type=friends&userId=${userId}`;
    console.log(url)
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch posts");

      const data = await response.json();
      console.log(data)
      dispatch(setPosts({ posts: data }));
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, [dispatch, filter, token, userId]);

  useEffect(() => {
    if (isProfile) {
      getUserPosts();
    } else {
      getPosts();
    }
  }, [isProfile, getPosts, getUserPosts, filter]);

 
  

  return (
    <>
      {posts?.map(
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
            type={type} // Pass type
            eventDate={eventDate}
            eventLocation={eventLocation}
            attendees={attendees}
          />
        )
      )}
    </>
  );
};

export default PostsWidget;
