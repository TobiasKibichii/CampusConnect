import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Button,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getSuggestedGroups } from "../../services/api.js";

const SuggestedGroups = () => {
  const token = useSelector((state) => state.token);
  const currentUser = useSelector((state) => state.user);
  const userId = currentUser?._id;
  const navigate = useNavigate();

  // States for suggested groups and user's own groups.
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);

  // Fetch suggested groups for the user
  useEffect(() => {
    const fetchSuggestedGroups = async () => {
      if (userId && token) {
        const data = await getSuggestedGroups(userId, token);
        setSuggestedGroups(data);
      }
    };
    fetchSuggestedGroups();
  }, [userId, token]);

  // Fetch user's groups (to know membership status)
  useEffect(() => {
    const fetchUserGroups = async () => {
      if (token) {
        try {
          const response = await fetch("http://localhost:6001/groups", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error("Failed to fetch your groups");
          }
          const data = await response.json();
          // Expected data structure: { myGroups, suggestedGroups }
          setUserGroups(data.myGroups || []);
        } catch (error) {
          console.error("Error fetching user groups:", error);
        }
      }
    };
    fetchUserGroups();
  }, [token]);

  // Helper to check if the current user is already a member of a group.
  const isUserInGroup = (groupId) => {
    return userGroups.some(
      (group) => group._id.toString() === groupId.toString()
    );
  };

  // Handler for join request functionality.
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
      // Update the suggested groups list to mark the request as sent.
      setSuggestedGroups((prev) =>
        prev.map((item) =>
          item.group._id.toString() === data.group._id.toString()
            ? { ...item, requested: true }
            : item
        )
      );
      alert("Join request sent. Please wait for the group creator's approval.");
    } catch (err) {
      console.error("Join group error:", err);
    }
  };

  // Handler to conditionally open group messages.
  // Only allow navigation if the user is already a member.
  const handleOpenGroup = (groupId) => {
    if (!groupId) {
      console.error("Invalid group ID");
      return;
    }
    if (isUserInGroup(groupId)) {
      navigate(`/groupMessages/${groupId}/messages`);
    } else {
      alert("You must be a member of this group to view messages.");
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Suggested Groups
      </Typography>
      <List>
        {suggestedGroups && suggestedGroups.length > 0 ? (
          suggestedGroups.map((item, index) => (
            <ListItem
              key={index}
              divider
              button
              onClick={() => handleOpenGroup(item.group._id)}
            >
              <ListItemText
                primary={item.group.name}
                secondary={`Mutual Friends: ${item.mutualCount}`}
              />
              {isUserInGroup(item.group._id) ? (
                <Button variant="outlined" disabled>
                  Joined
                </Button>
              ) : item.requested ? (
                <Button variant="outlined" disabled>
                  Requested
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinGroup(item.group._id);
                  }}
                >
                  Join
                </Button>
              )}
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No group suggestions found.
          </Typography>
        )}
      </List>
    </Paper>
  );
};

export default SuggestedGroups;
