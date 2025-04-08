import React, { useState } from "react";
import { Box, Button } from "@mui/material";

// Import components (adjust paths as needed)
import Details from "./details.jsx"; // Center: details of the post/event
import NoteEditor from "./noteEditor.jsx"; // Left: notes editor
import SummaryCard from "./summaryCard.jsx"; // Right: summary display

const Index = () => {
  const [showSummary, setShowSummary] = useState(false);

  // Example post/event data; replace these with actual values from your state or URL params.
  const postId = "somePostId";
  const eventDescription = `
    This is a long event description that will be summarized.
    Replace this with the actual "about" and "whatYoullLearn" fields combined from your event details.
  `;

  const handleToggleSummary = () => {
    setShowSummary((prev) => !prev);
  };

  return (
    <Box display="flex" flexDirection="row" gap="1rem" p="2rem">
      {/* Left Column: Note Editor */}
      <Box flexBasis="25%">
        <NoteEditor postId={postId} />
      </Box>

      {/* Center Column: Event/Post Details */}
      <Box flexBasis="50%">
        <Details postId={postId} />
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
        {showSummary && <SummaryCard description={eventDescription} />}
      </Box>
    </Box>
  );
};

export default Index;
