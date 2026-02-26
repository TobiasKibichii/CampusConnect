import React from "react";
import { Paper, Typography, Box } from "@mui/material";

import { useState, useEffect } from "react";

import axios from "axios";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const Summary = ({ summary }) => {
  const { postId } = useParams();
  const [eventData, setEventData] = useState(null);

  const token = useSelector((state) => state.token);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await axios.get(
          `https://campusconnect-backend.onrender.com/events/${postId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setEventData(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    if (postId) {
      fetchEventData();
    }
  }, [postId]);

  return (
    <Paper elevation={3} sx={{ padding: "1rem", backgroundColor: "	#333333" }}>
      <Typography variant="h6" gutterBottom></Typography>
      <Box mb={2}>
        <Typography variant="subtitle2" color="textSecondary">
          About
        </Typography>
        <Typography variant="body2">
          {summary || "No summary available."}
        </Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          What You'll Learn
        </Typography>
        <Typography variant="body2"></Typography>
      </Box>
    </Paper>
  );
};

export default Summary;
