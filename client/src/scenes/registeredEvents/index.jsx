import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setPosts } from "state"; // Using existing posts slice
import PostWidget from "scenes/widgets/PostWidget";

const RegisteredEventsWidget = () => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts) || [];
  const token = useSelector((state) => state.token);

  // Fetch registered events from the backend
  useEffect(() => {
    axios
      .get("http://localhost:6001/events/getRegisteredEvents", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // Dispatch the fetched events into the Redux posts slice
        dispatch(setPosts({ posts: response.data }));
        console.log("Registered events fetched:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching registered events:", error);
      });
  }, [token, dispatch]);

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
          eventTimeFrom,
          eventTimeTo,
          about,
          whatYoullLearn,
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
            type={type} // "event" in this case
            eventDate={eventDate}
            eventTimeFrom={eventTimeFrom}
            eventTimeTo={eventTimeTo}
            about={about}
            whatYoullLearn={whatYoullLearn}
            attendees={attendees}
          />
        )
      )}
    </>
  );
};

export default RegisteredEventsWidget;
