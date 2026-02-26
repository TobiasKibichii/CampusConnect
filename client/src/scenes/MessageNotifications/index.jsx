import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const MessageNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const token = useSelector((state) => state.token);
  const navigate = useNavigate();

  // Fetch notifications from the backend
  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        "https://campusconnect-backend.onrender.com/messages/messageNotifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Mark notifications as read and clear the local notifications array
  const markNotificationsAsRead = async () => {
    try {
      const response = await fetch(
        "https://campusconnect-backend.onrender.com/messageNotifications/markNotificationsRead",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(response.data);
      if (!response.ok) {
        throw new Error("Failed to mark notifications as read");
      }
      // Clear notifications locally (so the count will disappear)
      setNotifications([]);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      markNotificationsAsRead();
    }
  }, [token]);

  return (
    <Box
      sx={{
        width: 300,
        bgcolor: "background.paper",
        maxHeight: 400,
        overflowY: "auto",
      }}
    >
      <Typography variant="h6" sx={{ p: 1 }}>
        Messages
      </Typography>
      <Divider />
      <List>
        {notifications.map((notif) => (
          <ListItem
            key={notif._id}
            button
            onClick={() => {
              // Navigate to the chat section using the sender's ID.
              navigate(`/chat/${notif.sender._id}`);
            }}
          >
            <ListItemAvatar>
              <Avatar
                src={
                  notif.sender.picturePath
                    ? `https://campusconnect-backend.onrender.com/assets/${notif.sender.picturePath}`
                    : ""
                }
              />
            </ListItemAvatar>
            <ListItemText
              primary={`${notif.sender.firstName} ${notif.sender.lastName}`}
              secondary={notif.message || "New message"}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default MessageNotifications;
