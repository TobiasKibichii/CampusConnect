import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, TextField, IconButton, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import WidgetWrapper from "components/WidgetWrapper";
import FlexBetween from "components/FlexBetween";

const ChatSection = () => {
  // Get conversation partner's ID from the route parameter
  const { userId } = useParams();
  const [conversationPartner, setConversationPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);
  const currentUser = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  // Fetch the conversation partner's details
  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const response = await fetch(`http://localhost:6001/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setConversationPartner(data);
      } catch (err) {
        console.error("Error fetching conversation partner:", err);
      }
    };

    if (userId) fetchPartner();
  }, [userId, token]);

  // Setup Socket.io connection
  useEffect(() => {
    socketRef.current = io("http://localhost:6001", {
      auth: { token },
    });
    // Join the current user's room
    socketRef.current.emit("join", currentUser._id);

    // Listen for incoming messages
    socketRef.current.on("receiveMessage", (message) => {
      // Ensure the message belongs to the conversation
      if (
        (message.sender === conversationPartner?._id &&
          message.receiver === currentUser._id) ||
        (message.sender === currentUser._id &&
          message.receiver === conversationPartner?._id)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [currentUser, conversationPartner, token]);

  // Fetch conversation history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:6001/messages?sender=${currentUser._id}&receiver=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    if (userId) fetchMessages();
  }, [currentUser, userId, token]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const messagePayload = {
      senderId: currentUser._id,
      receiverId: userId,
      text: newMessage,
    };

    // Emit the message to the server via Socket.io
    socketRef.current.emit("sendMessage", messagePayload);

    // Clear the input; do not update the UI here since we rely on "receiveMessage"
    setNewMessage("");
  };

  // Show a loading state if conversationPartner hasn't loaded yet
  if (!conversationPartner) {
    return (
      <WidgetWrapper>
        <Typography>Loading chat...</Typography>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper
      sx={{
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        p: 2,
        position: "relative",
      }}
    >
      {/* Chat Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5">
          Chat with {conversationPartner.firstName}{" "}
          {conversationPartner.lastName}
        </Typography>
      </Box>

      {/* Message List */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          backgroundColor: "#f9f9f9",
          p: 2,
          borderRadius: "8px",
          mb: 2,
        }}
      >
        {messages.map((msg) => (
          <FlexBetween
            key={msg._id}
            sx={{
              justifyContent:
                msg.sender === currentUser._id ? "flex-end" : "flex-start",
              mb: 1,
            }}
          >
            <Paper
              sx={{
                p: 1.5,
                maxWidth: "70%",
                backgroundColor:
                  msg.sender === currentUser._id ? "#1976d2" : "#e0e0e0",
                color: msg.sender === currentUser._id ? "#fff" : "#000",
              }}
            >
              <Typography variant="body1">{msg.text}</Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", textAlign: "right", mt: 0.5 }}
              >
                {new Date(msg.createdAt).toLocaleTimeString()}
              </Typography>
            </Paper>
          </FlexBetween>
        ))}
      </Box>

      {/* Message Input */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          borderTop: "1px solid #ccc",
          pt: 1,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          sx={{ mr: 1 }}
        />
        <IconButton color="primary" onClick={handleSendMessage}>
          <SendIcon />
        </IconButton>
      </Box>
    </WidgetWrapper>
  );
};

export default ChatSection;
