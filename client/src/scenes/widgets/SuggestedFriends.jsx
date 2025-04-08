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
import { getSuggestedFriends } from "../../services/api.js"; // Ensure this function is defined in your API service

const SuggestedFriends = () => {
  const token = useSelector((state) => state.token);
  const userId = useSelector((state) => state.user?._id);
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      if (userId && token) {
        const data = await getSuggestedFriends(userId, token);
        setFriends(data);
      }
    };
    fetchFriends();
  }, [userId, token]);

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Suggested Friends
      </Typography>
      <List>
        {friends && friends.length > 0 ? (
          friends.map((item, index) => (
            <ListItem
              key={index}
              button
              onClick={() => navigate(`/profile/${item.candidate._id}`)}
            >
              <ListItemText
                primary={`${item.candidate.firstName} ${item.candidate.lastName}`}
                secondary={`Mutual Friends: ${item.mutualCount}`}
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No friend suggestions found.
          </Typography>
        )}
      </List>
    </Paper>
  );
};

export default SuggestedFriends;
