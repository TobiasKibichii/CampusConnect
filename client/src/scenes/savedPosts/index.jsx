import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setPosts } from "state";
import PostWidget from "scenes/widgets/PostWidget";

const PostsWidget = ({ userId, isProfile = false, filter }) => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts) || []; // Ensure it's an array
  const token = useSelector((state) => state.token);

  // Fetch saved posts from the backend
  useEffect(() => {
    axios
      .get("https://campusconnect-backend.onrender.com/save", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        dispatch(setPosts({ posts: response.data }));
        console.log(response.data);
      })
      .catch((err) => {
        console.error("Error fetching saved items:", err);
      });
  }, [token, dispatch]);

  console.log("Redux posts:", posts);

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "1rem" }}>
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
            type={type}
            eventDate={eventDate}
            eventLocation={eventLocation}
            attendees={attendees}
          />
        ),
      )}
    </div>
  );
};

export default PostsWidget;
