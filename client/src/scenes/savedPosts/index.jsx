import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

const SavedItemsPage = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [filter, setFilter] = useState("all"); // "all", "post", "event"
  const token = useSelector((state) => state.token);

  useEffect(() => {
    axios
      .get("http://localhost:6001/users/saved", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSavedItems(response.data.savedItems);
      })
      .catch((err) => {
        console.error("Error fetching saved items:", err);
      });
  }, [token]);

  // Filter saved items based on type if a filter is applied
  const filteredItems =
    filter === "all"
      ? savedItems
      : savedItems.filter((item) => item.type === filter);

  return (
    <Box p="2rem">
      <Typography variant="h4" mb="1rem">
        Your Saved Items
      </Typography>
      <FormControl
        variant="outlined"
        size="small"
        sx={{ mb: 2, minWidth: 150 }}
      >
        <InputLabel>Filter By</InputLabel>
        <Select
          label="Filter By"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="post">Posts</MenuItem>
          <MenuItem value="event">Events</MenuItem>
        </Select>
      </FormControl>
      <Box display="flex" flexDirection="column" gap="1rem">
        {filteredItems.map((item) => (
          <Box
            key={item._id}
            p="1rem"
            border="1px solid #ddd"
            borderRadius="4px"
          >
            <Typography variant="h6">
              {item.type === "event" ? item.name : item.title}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Type: {item.type}
            </Typography>
            {/* Additional details can be added here */}
          </Box>
        ))}
        {filteredItems.length === 0 && (
          <Typography>No saved items match the filter.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default SavedItemsPage;
