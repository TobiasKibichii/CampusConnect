// components/MessageNotifications.jsx
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

  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:6001/messages/messageNotifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
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
              // Navigate to the chat section. If you have a conversation id, use that.
              // Otherwise, navigate using the sender id.
              navigate(`/chat/${notif.sender._id}`);
            }}
          >
            <ListItemAvatar>
              <Avatar
                src={
                  notif.sender.picturePath
                    ? `http://localhost:6001/assets/${notif.sender.picturePath}`
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
