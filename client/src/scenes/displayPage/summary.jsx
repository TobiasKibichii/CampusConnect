import React from "react";
import { Paper, Typography, Box } from "@mui/material";

const Summary = ({ aboutSummary, whatYoullLearnSummary }) => {
  return (
    <Paper elevation={3} sx={{ padding: "1rem", backgroundColor: "#f9f9" }}>
      <Typography variant="h6" gutterBottom>
        Summaries
      </Typography>
      <Box mb={2}>
        <Typography variant="subtitle2" color="textSecondary">
          About
        </Typography>
        <Typography variant="body2">
          {aboutSummary || "No summary available."}
        </Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          What You'll Learn
        </Typography>
        <Typography variant="body2">
          {whatYoullLearnSummary || "No summary available."}
        </Typography>
      </Box>
    </Paper>
  );
};

export default Summary;
