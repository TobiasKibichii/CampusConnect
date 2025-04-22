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
  const userId = useSelector((state) => state.user?._id);

  const [recommendations, setRecommendations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recommendationsPerPage = 10;
  const navigate = useNavigate();
  const [showFullText, setShowFullText] = useState(false);

  // Helper function to strip HTML tags and trim the text to 10 words
  const stripHtmlAndTrim = (description, wordLimit = 5) => {
    const strippedText = description.replace(/<[^>]+>/g, ""); // Strip HTML tags
    const words = strippedText.split(" ");
    return (
      words.slice(0, wordLimit).join(" ") +
      (words.length > wordLimit ? "..." : "")
    );
  };

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
              sx={{ alignItems: "center" }}
            >
              {/* Display the event image if available */}
              {rec.post.picturePath && (
                <Box
                  component="img"
                  src={`http://localhost:6001/assets/${rec.post.picturePath}`}
                  alt={rec.post.title}
                  sx={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 1,
                    marginRight: 2,
                  }}
                />
              )}
              <ListItemText
                primary={rec.post.title}
                secondary={
                  <>
                    <Typography variant="body2">
                      {showFullText ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: rec.post.description,
                          }}
                        />
                      ) : (
                        stripHtmlAndTrim(rec.post.description)
                      )}
                    </Typography>
                    
                    <Typography variant="caption">
                      Similarity:{" "}
                      {rec.similarity != null
                        ? rec.similarity.toFixed(2)
                        : "N/A"}
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
