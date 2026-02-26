import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import socket from "../../socket.js";
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

// Connect to the Socket.IO server (adjust the URL as needed)

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  // Fetch notifications from the backend when the token changes
  useEffect(() => {
    axios
      .get("https://campusconnect-backend.onrender.com/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setNotifications(response.data);
      })
      .catch((err) => {
        console.error("Error fetching notifications:", err);
      });
  }, [token]);

  // Set up Socket.IO to join the user's room and listen for new notifications
  useEffect(() => {
    if (user) {
      socket.emit("join", user._id);
    }
    socket.on("newNotification", (notification) => {
      // Prepend the new notification to the list
      console.log("yebooooo");
      setNotifications((prev) => [notification, ...prev]);
    });
    return () => {
      socket.off("newNotification");
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      console.log("📡 Joining socket room with user ID:", user._id);
      socket.emit("join", user._id);
    }

    socket.on("groupJoinApproved", (notification) => {
      console.log(
        "📨 Received groupJoinApproved socket notification:",
        notification,
      );
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      console.log("🧹 Cleaning up socket listener for groupJoinApproved");
      setTimeout(() => {
        socket.off("groupJoinApproved");
      }, 500);
    };
  }, [user]);

  return (
    <Box p="2rem">
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>
      {notifications.length === 0 ? (
        <Typography>No notifications at this time.</Typography>
      ) : (
        <List>
          {notifications.map((notif, index) => (
            <Box key={notif._id}>
              <ListItem alignItems="flex-start" button>
                <ListItemAvatar>
                  <Avatar
                    src={notif.friendId?.picturePath}
                    alt={`${notif.friendId?.firstName} ${notif.friendId?.lastName}`}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={`${notif.friendId?.firstName || " "} ${notif.friendId?.lastName || " "} ${notif.message}`}
                  secondary={new Date(notif.createdAt).toLocaleString()}
                />
              </ListItem>
              {index < notifications.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </Box>
          ))}
        </List>
      )}
    </Box>
  );
};

export default NotificationsPage;
