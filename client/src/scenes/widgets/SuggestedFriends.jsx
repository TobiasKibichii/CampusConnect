import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import WidgetWrapper from "components/WidgetWrapper";
import Friend from "components/Friend";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getSuggestedFriends } from "../../services/api.js";

const SuggestedFriends = () => {
  const token = useSelector((state) => state.token);
  const userId = useSelector((state) => state.user?._id);
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      if (userId && token) {
        try {
          const data = await getSuggestedFriends(userId, token);
          setFriends(data);
        } catch (err) {
          console.error("Error fetching suggested friends:", err);
        }
      }
    };
    fetchFriends();
  }, [userId, token]);

  return (
    <WidgetWrapper>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Suggested Friends
      </Typography>
      <Box display="flex" flexDirection="column" gap="1rem">
        {friends && friends.length > 0 ? (
          friends.map((item, index) => {
            const candidate = item.candidate;
            return (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  cursor: "pointer",
                  borderBottom: "1px solid #ccc",
                  pb: 1,
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap="1rem"
                  onClick={() => navigate(`/profile/${candidate._id}`)}
                >
                  <Friend
                    friendId={candidate._id}
                    name={`${candidate.firstName} ${candidate.lastName}`}
                    subtitle={candidate.occupation}
                    userPicturePath={candidate.picturePath}
                  />
                  <Typography variant="body2" color="textSecondary">
                    {`Mutual Friends: ${item.mutualCount}`}
                  </Typography>
                </Box>
                
              </Box>
            );
          })
        ) : (
          <Typography variant="body2" color="textSecondary">
            No friend suggestions found.
          </Typography>
        )}
      </Box>
    </WidgetWrapper>
  );
};

export default SuggestedFriends;
