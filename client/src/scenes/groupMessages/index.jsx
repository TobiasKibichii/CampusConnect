import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  useTheme,
  TextField,
  Button,
  Avatar,
  Divider,
  IconButton,
} from "@mui/material";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import WidgetWrapper from "components/WidgetWrapper";
import FlexBetween from "components/FlexBetween";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ReplyIcon from "@mui/icons-material/Reply";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

// Helper function to format 'time ago'
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diff = now - past;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const GroupMessages = () => {
  const { palette } = useTheme();
  const main = palette.neutral.main;
  const dark = palette.neutral.dark;
  const medium = palette.neutral.medium;

  const { groupId } = useParams();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);

  const [groupDetails, setGroupDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMessage, setExpandedMessage] = useState({});

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch group details and messages
  useEffect(() => {
    fetch(`http://localhost:6001/groupMessages/${groupId}/messages`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch group details");
        return res.json();
      })
      .then((data) => {
        setGroupDetails(data.group);
        setMessages(data.messages || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching group data:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [groupId, token]);


  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const submitNewMessage = async () => {
    if (!newMessageText.trim()) return;
    try {
      const res = await fetch(
        `http://localhost:6001/groupMessages/${groupId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: newMessageText, parentMessageId: null }),
        }
      );
      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setNewMessageText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const submitReply = async (parentMessage) => {
    if (!replyText.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:6001/groupMessages/${groupId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: replyText,
            parentMessageId: parentMessage._id,
          }),
        }
      );

      

      // Emit the reply to group via Socket.io
      console.log("bbbbbbb")
      console.log("bbbbbbb")
      console.log("bbbbbbb")
      socketRef.current.emit("sendGroupMessage", {
        senderId: loggedInUserId,
        groupId,
        text: replyText,
        parentMessageId: parentMessage._id,
        message: data.message, // optional: include the saved message
      });


      if (!res.ok) throw new Error("Failed to send reply");
      const data = await res.json();

      setMessages((prev) => [...prev, data.message]);
      setReplyingTo(null);
      setReplyText("");
    } catch (err) {
      console.error("Error sending reply:", err);
    }
  };


  const toggleMessageExpansion = (id) =>
    setExpandedMessage((prev) => ({ ...prev, [id]: !prev[id] }));

  const renderMessage = (message, level = 0) => {
    const profileUrl = message.sender?.picturePath
      ? `http://localhost:6001/assets/${message.sender.picturePath}`
      : "/defaultAvatar.png";

    return (
      <Box key={message._id} ml={`${level * 2}rem`} mt="0.5rem">
        <Divider />
        <Box display="flex" alignItems="center" gap="0.5rem">
          <Avatar
            src={profileUrl}
            alt={`${message.sender?.firstName} ${message.sender?.lastName}`}
          />
          <Box flex={1}>
            <Typography
              sx={{ fontWeight: "bold", color: main, cursor: "pointer" }}
              component={Link}
              to={`/profile/${message.sender?._id}`}
              style={{ textDecoration: "none", color: main }}
            >
              {message.sender?._id === loggedInUserId
                ? "You"
                : `${message.sender?.firstName} ${message.sender?.lastName}`}
            </Typography>
            <Typography>{message.text}</Typography>
            <Typography variant="caption" color={main}>
              {formatTimeAgo(message.createdAt)}
            </Typography>
          </Box>
          <Button
            onClick={() => {
              if (replyingTo?._id === message._id) {
                setReplyingTo(null);
                setReplyText("");
              } else {
                setReplyingTo(message);
                setReplyText(`@${message.sender?.firstName} `);
              }
            }}
            size="small"
          >
            <ReplyIcon fontSize="small" />
          </Button>
          {level === 0 && message.replies?.length > 0 && (
            <Box display="flex" alignItems="center" ml="2rem" mt="0.5rem">
              <IconButton
                onClick={() => toggleMessageExpansion(message._id)}
                size="small"
              >
                <ArrowDropDownIcon
                  sx={{
                    transform: expandedMessage[message._id]
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.3s",
                  }}
                />
              </IconButton>
              <Typography variant="caption">
                {message.replies.length}{" "}
                {message.replies.length === 1 ? "reply" : "replies"}
              </Typography>
            </Box>
          )}
        </Box>

        {replyingTo?._id === message._id && (
          <Box mt="0.5rem" ml="2rem">
            <TextField
              fullWidth
              placeholder={`Reply to @${message.sender?.firstName}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <Button onClick={() => submitReply(message)} size="small">
              Send
            </Button>
          </Box>
        )}

        {expandedMessage[message._id] &&
          message.replies.map((reply) => renderMessage(reply, level + 1))}
      </Box>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error)
    return (
      <WidgetWrapper>
        <Typography color={medium}>Error: {error}</Typography>
      </WidgetWrapper>
    );

  return (
    <WidgetWrapper m="2rem 0">
      {/* Group Header */}
      <Box mb="1rem">
        <Typography variant="h5" color={dark} fontWeight="bold">
          {groupDetails?.name || "Group Chat"}
        </Typography>
      </Box>

      {/* Render messages */}
      <Box>
        {messages
          .filter((m) => !m.parentMessageId)
          .map((msg) => renderMessage(msg))}
      </Box>
      <Box ref={messagesEndRef} />

      {/* New message input */}
      <Box mt="1rem">
        <TextField
          fullWidth
          placeholder="Type your message..."
          value={newMessageText}
          onChange={(e) => setNewMessageText(e.target.value)}
        />
        <Button onClick={submitNewMessage} size="small">
          Send
        </Button>
      </Box>
    </WidgetWrapper>
  );
};

export default GroupMessages;
