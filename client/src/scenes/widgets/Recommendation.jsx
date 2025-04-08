import { useState, useEffect } from "react";
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
import { getRecommendations } from "../../services/api.js";

const Recommendations = () => {
  const token = useSelector((state) => state.token);
  // Assuming you have the current userId in your store; if not, adjust accordingly.
  const userId = useSelector((state) => state.user?._id);
  const [recommendations, setRecommendations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recommendationsPerPage = 10;
  const navigate = useNavigate();
  console.log(token, userId)

  
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (userId) {
        const recs = await getRecommendations(userId, token);
        setRecommendations(recs);
      }
    };

    if (token && userId) {
      fetchRecommendations();
    }
  }, [token, userId]);

  // Pagination logic (similar to PopularEventsWidget)
  const totalPages = Math.ceil(recommendations.length / recommendationsPerPage);
  const indexOfLast = currentPage * recommendationsPerPage;
  const indexOfFirst = indexOfLast - recommendationsPerPage;
  const currentRecommendations = recommendations.slice(
    indexOfFirst,
    indexOfLast
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Recommended for You
      </Typography>
      {totalPages > 1 && (
        <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
          {Array.from({ length: totalPages }, (_, idx) => {
            const pageNum = idx + 1;
            return (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? "contained" : "outlined"}
                size="small"
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
        </Box>
      )}
      <List>
        {currentRecommendations.length > 0 ? (
          currentRecommendations.map((rec) => (
            <ListItem
              key={rec.post._id}
              button
              onClick={() => navigate(`/events/${rec.post._id}`)}
            >
              <ListItemText
                primary={rec.post.title}
                secondary={
                  <>
                    <Typography variant="body2">
                      {rec.post.description}
                    </Typography>
                    <Typography variant="caption">
                      Similarity: {rec.similarity.toFixed(2)}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No recommendations available.
          </Typography>
        )}
      </List>
    </Paper>
  );
};

export default Recommendations;
