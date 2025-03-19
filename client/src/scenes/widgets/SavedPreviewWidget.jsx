import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SavedPreview = () => {
  const [previewItems, setPreviewItems] = useState([]);
  const token = useSelector((state) => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:6001/users/saved", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // Assume backend returns { savedItems: [...] }
        // We'll display the first five saved items
        setPreviewItems(response.data.savedItems.slice(0, 5));
      })
      .catch((err) => {
        console.error("Error fetching saved items:", err);
      });
  }, [token]);

  return (
    <Box p="1rem" border="1px solid #ccc" borderRadius="8px" mt="1rem">
      {/* Clickable header to navigate to the full saved items page */}
      <Box
        sx={{
          cursor: "pointer",
          mb: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        onClick={() => navigate("/saved")}
      >
        <Typography variant="h6">Your Saved Items</Typography>
        <Button variant="text" size="small">
          See All
        </Button>
      </Box>
      <Box display="flex" gap="1rem" flexWrap="wrap">
        {previewItems.map((item) => (
          <Box
            key={item._id}
            p="0.5rem"
            border="1px solid #ddd"
            borderRadius="4px"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/saved")}
          >
            {/* Display title for posts and name for events */}
            <Typography variant="subtitle1">
              {item.type === "event" ? item.name : item.title}
            </Typography>
            {/* Optionally, display the type as a small label */}
            <Typography variant="caption" color="textSecondary">
              {item.type}
            </Typography>
          </Box>
        ))}
        {previewItems.length === 0 && (
          <Typography variant="body2">No saved items yet.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default SavedPreview;
