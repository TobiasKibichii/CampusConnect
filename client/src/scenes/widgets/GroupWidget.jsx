import {
  Typography,
  useTheme,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";

const GroupWidget = () => {
  const { palette } = useTheme();
  const dark = palette.neutral.dark;
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  // Retrieve real user and token from Redux
  const currentUser = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const navigate = useNavigate();

  // States for user's groups, suggested groups, loading state, input and errors
  const [userGroups, setUserGroups] = useState([]);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState(null);

  // Helper: check if the user is already a member of a specific group.
  const isUserInGroup = (groupId) => {
    return userGroups.some(
      (group) => group._id.toString() === groupId.toString()
    );
  };

  // Fetch groups data from backend on mount
  useEffect(() => {
    fetch("http://localhost:6001/groups", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch groups");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Fetched groups data:", data);
        // Expected structure: { myGroups, suggestedGroups }
        setUserGroups(data.myGroups || []);
        setSuggestedGroups(data.suggestedGroups || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  // Handler for creating a new group (for editors)
  const handleCreateGroup = (e) => {
    e.preventDefault();
    fetch("http://localhost:6001/groups/postGroup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: groupName }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error creating group");
        }
        return res.json();
      })
      .then((data) => {
        // Assume response contains the created group under "group"
        setUserGroups((prev) => [...prev, data.group]);
        // Remove the new group from suggestions if present (using string conversion)
        setSuggestedGroups((prev) =>
          prev.filter(
            (group) => group._id.toString() !== data.group._id.toString()
          )
        );
        setGroupName("");
      })
      .catch((err) => {
        console.error("Create group error:", err);
      });
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const response = await fetch(
        `http://localhost:6001/groups/${groupId}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error joining group");
      }
      const data = await response.json();

      // Update user groups with the joined group
      setUserGroups((prev) => [...prev, data.group]);

      // Remove the joined group from suggested groups, ensuring string comparisons
      setSuggestedGroups((prev) =>
        prev.filter(
          (group) => group._id.toString() !== data.group._id.toString()
        )
      );

      // Navigate to the group's messages section
      navigate(`/groupMessages/${groupId}/messages`);
    } catch (err) {
      console.error("Join group error:", err);
    }
  };


  // Handler to open group messages section
  const handleOpenGroup = (groupId) => {
    if (!groupId) {
      console.error("Invalid group ID");
      return;
    }
    navigate(`/groupMessages/${groupId}/messages`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const hasGroup = userGroups && userGroups.length > 0;

  return (
    <WidgetWrapper>
      <FlexBetween>
        <Typography color={dark} variant="h5" fontWeight="500">
          Groups
        </Typography>
        {/* For editors who haven't joined/created a group, show the "Create Group" prompt */}
        {currentUser?.role === "editor" && !hasGroup && (
          <Typography color={medium}>Create Group</Typography>
        )}
      </FlexBetween>

      {/* Display user's groups */}
      {hasGroup ? (
        <div>
          <Typography color={main} variant="h6" mt="1rem">
            Your Groups
          </Typography>
          <List>
            {userGroups.map((group) => (
              <ListItem
                key={group._id}
                divider
                button
                onClick={() => handleOpenGroup(group._id)}
              >
                <ListItemText primary={group.name} />
              </ListItem>
            ))}
          </List>
        </div>
      ) : (
        <div>
          {currentUser?.role === "editor" ? (
            // For editors: if no group, show the creation form.
            <form onSubmit={handleCreateGroup}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                sx={{ margin: "0.75rem 0" }}
              />
              <Button type="submit" variant="contained" color="primary">
                Create Group
              </Button>
            </form>
          ) : (
            // For regular users: if no group, show a message.
            <Typography color={medium} m="0.5rem 0">
              You are not part of any group.
            </Typography>
          )}
        </div>
      )}

      {/* Suggested Groups Section */}
      <Typography color={dark} variant="h6" mt="1rem">
        Suggested Groups
      </Typography>
      {suggestedGroups && suggestedGroups.length > 0 ? (
        <List>
          {suggestedGroups.map((group) => (
            <ListItem key={group._id} divider>
              <ListItemText
                primary={
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => handleOpenGroup(group._id)}
                  >
                    {group.name}
                  </span>
                }
              />
              {isUserInGroup(group._id) ? (
                <Button variant="outlined" disabled>
                  Joined
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the ListItem click
                    handleJoinGroup(group._id);
                  }}
                >
                  Join
                </Button>
              )}
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography color={medium}>No groups available to join.</Typography>
      )}
    </WidgetWrapper>
  );
};

export default GroupWidget;
