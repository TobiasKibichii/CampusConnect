import React, { useState } from "react";
import { Box, Button } from "@mui/material";

// Import components (adjust paths as needed)
import Details from "./details.jsx"; // Center: details of the post/event
import NoteEditor from "./noteEditor.jsx"; // Left: notes editor
import SummaryCard from "./summaryCard.jsx"; // Right: summary display

const Index = () => {
  const [showSummary, setShowSummary] = useState(false);

  const handleToggleSummary = () => {
    setShowSummary((prev) => !prev);
  };

  return (
    <Box display="flex" flexDirection="row" gap="1rem" p="2rem">
      {/* Left Column: Note Editor */}
      <Box flexBasis="25%">
        <NoteEditor />
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
        {showSummary && <SummaryCard />}
      </Box>
    </Box>
  );
};

export default Index;
