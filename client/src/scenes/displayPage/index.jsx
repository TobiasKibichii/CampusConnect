import React, { useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

// Import components (adjust paths as needed)
import Details from "./details.jsx"; // Center: details of the post/event
import NoteEditor from "./noteEditor.jsx"; // Left: notes editor
import SummaryCard from "./summaryCard.jsx"; // Right: summary display

const Index = () => {
  const [showSummary, setShowSummary] = useState(false);
  const { postId } = useParams();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state) => state.token);

  const handleToggleSummary = () => {
    setShowSummary((prev) => !prev);
  };

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await axios.get(
          `https://campusconnect-backend.onrender.com/events/${postId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setEventData(response.data); // Set event data
        console.log("Fetched event data:", response.data); // Log the response directly
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [postId, token]); // Dependencies for the effect

  return (
    <Box display="flex" flexDirection="row" gap="1rem" p="2rem">
      {/* Left Column: Note Editor */}
      <Box flexBasis="25%">
        <NoteEditor postId={postId} />
      </Box>

      {/* Center Column: Event/Post Details */}
      <Box flexBasis="50%">
        <Details />
      </Box>

      {/* Right Column: Show/Hide Summary Button at the top, Summary below */}
      <Box
        flexBasis="25%"
        display="flex"
        flexDirection="column"
        alignItems="stretch"
        gap="1rem"
      >
        <Button variant="contained" onClick={handleToggleSummary}>
          {showSummary ? "Hide Summary" : "Show Summary"}
        </Button>
        {showSummary && (
          <SummaryCard
            about={eventData.about}
            type={eventData.type}
            description={eventData.description}
            whatYoullLearn={eventData.whatYoullLearn}
          />
        )}
      </Box>
    </Box>
  );
};

export default Index;
