import {
  Typography,
  useTheme,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Badge
} from "@mui/material";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import io from "socket.io-client"; // Ensure you have a socket instance set up
import axios from "axios";

const GroupWidget = () => {
  const { palette } = useTheme();
  const dark = palette.neutral.dark;
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  // Retrieve real user and token from Redux
  const currentUser = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const navigate = useNavigate();
  // Create a single socket instance – you may also want to extract this into a separate file
  const socket = io("http://localhost:6001");

  // States for user's groups, suggested groups, loading state, input and errors
  const [userGroups, setUserGroups] = useState([]);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [groupNotificationsCount, setGroupNotificationsCount] = useState(0);

  // Helper: check if the user is already a member of a specific group.
  const isUserInGroup = (groupId) => {
    return userGroups.some(
      (group) => group._id.toString() === groupId.toString()
    );
  };

  // Join user room so that they can receive socket notifications
  useEffect(() => {
    if (currentUser) {
      socket.emit("join", currentUser._id);
    }
    // Listen for incoming group join requests (if this user is an admin)
    socket.on("groupJoinRequest", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });
    return () => {
      socket.off("groupJoinRequest");
    };
  }, [currentUser, socket]);

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



  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:6001/notifications/groupNotifications", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setGroupNotificationsCount(
            response.data.filter((n) => !n.read).length
          );
        })
        .catch((err) => {
          console.error("Error fetching group notifications:", err);
        });
    }
  }, [token]);



  const markGroupNotificationsAsRead = async () => {
    console.log("📥 markGroupNotificationsAsRead HIT");
    try {
      await axios.put(
        "http://localhost:6001/notifications/groupNotifications/markAsRead",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGroupNotificationsCount(0);
    } catch (err) {
      console.error("Error marking group notifications as read:", err);
    }
  };




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
        // Optionally remove the new group from suggestions if present
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

  // Handler to send join request to a group.
  // This sends a POST request and then emits a socket event so that the target admin gets notified.
  const handleJoinGroup = async (groupId) => {
    try {
      const response = await fetch(
        `http://localhost:6001/groups/${groupId}/requestJoin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error sending join request");
      }
      const data = await response.json();
      // Instead of removing the group from suggested groups, mark it as requested.
      setSuggestedGroups((prev) =>
        prev.map((group) =>
          group._id.toString() === data.group._id.toString()
            ? { ...group, requested: true }
            : group
        )
      );
      alert("Join request sent. Please wait for the group creator's approval.");
    } catch (err) {
      console.error("Join group error:", err);
    }
  };

  // Handler to open group messages section; only allow if the user is a member.
  const handleOpenGroup = (groupId) => {
    if (!groupId) {
      console.error("Invalid group ID");
      return;
    }
    // Only open if the user is a member.
    if (isUserInGroup(groupId)) {
      navigate(`/groupMessages/${groupId}/messages`);
    } else {
      alert("You must be a member of this group to view messages.");
    }
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
                <Badge
                  badgeContent={groupNotificationsCount}
                  color="error"
                  
                >
                  <ListItemText
                    primary={group.name}
                    onClick={async () => {
                      console.log("🔔 Notification icon clicked");
                      await markGroupNotificationsAsRead();
                      
                    }}
                  />
                </Badge>
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
              ) : group.requested ? (
                <Button variant="outlined" disabled>
                  Requested
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
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
