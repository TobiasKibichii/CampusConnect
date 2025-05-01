import {
  Box,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useSelector } from "react-redux";
import Navbar from "scenes/navbar";
import UserWidget from "scenes/widgets/UserWidget";
import PostsWidget from "scenes/widgets/PostsWidget";
import GroupWidget from "scenes/widgets/GroupWidget";
import FriendListWidget from "scenes/widgets/FriendListWidget";
import SavedPreviewWidget from "scenes/widgets/SavedPreviewWidget"; // New component for saved items preview
import { useState } from "react";
import PopularEventsWidget from "scenes/widgets/PopularEventsWidget";
import DisplayPage from "scenes/displayPage";
import Recommendations from "scenes/widgets/Recommendation";
import SuggestedGroups from "scenes/widgets/SuggestedGroups";
import SuggestedFriends from "scenes/widgets/SuggestedFriends";
import DateFilteredEventsWidget from "scenes/widgets/DateFilteredEventsWidget";

const HomePage = () => {
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const { _id, userPicturePath } = useSelector((state) => state.user);

  // State for post filtering
  const [postFilter, setPostFilter] = useState("all"); // Default to "All Posts"

  return (
    <Box>
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="0.5rem"
        justifyContent="space-between"
      >
        <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
          <UserWidget userId={_id} picturePath={userPicturePath} />
          {/* New Saved Preview Widget placed below the UserWidget */}
          <SavedPreviewWidget userId={_id} />
          <DateFilteredEventsWidget />
          <PopularEventsWidget />
          <Recommendations />
        </Box>

        <Box
          flexBasis={isNonMobileScreens ? "42%" : undefined}
          mt={isNonMobileScreens ? undefined : "2rem"}
        >
          {/* Dropdown to Select Post Type */}
          <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
            <InputLabel>Filter Posts</InputLabel>
            <Select
              value={postFilter}
              onChange={(e) => setPostFilter(e.target.value)}
              label="Filter Posts"
            >
              <MenuItem value="all">All Posts</MenuItem>
              <MenuItem value="events">Events</MenuItem>
              <MenuItem value="friends">Friends' Posts</MenuItem>
            </Select>
          </FormControl>

          {/* Pass Filter Option to PostsWidget */}
          <PostsWidget userId={_id} filter={postFilter} />
         
        </Box>

        {isNonMobileScreens && (
          <Box flexBasis="26%">
            <GroupWidget userId={_id} />
            <Box m="2rem 0" />
            <FriendListWidget userId={_id} />
            <SuggestedGroups />
            <SuggestedFriends />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HomePage;
