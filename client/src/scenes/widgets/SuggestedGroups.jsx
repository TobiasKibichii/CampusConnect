import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Button,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getSuggestedGroups } from "../../services/api.js"; // Ensure this function is defined in your API service

const SuggestedGroups = () => {
  const token = useSelector((state) => state.token);
  const userId = useSelector((state) => state.user?._id);
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      if (userId && token) {
        const data = await getSuggestedGroups(userId, token);
        setGroups(data);
      }
    };
    fetchGroups();
  }, [userId, token]);

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Suggested Groups
      </Typography>
      <List>
        {groups && groups.length > 0 ? (
          groups.map((item, index) => (
            <ListItem
              key={index}
              button
              onClick={() => navigate(`/groups/${item.group._id}`)}
            >
              <ListItemText
                primary={item.group.name}
                secondary={`Mutual Friends: ${item.mutualCount}`}
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No group suggestions found.
          </Typography>
        )}
      </List>
    </Paper>
  );
};

export default SuggestedGroups;
