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

const PopularEventsWidget = () => {
  const token = useSelector((state) => state.token);
  const [popularEvents, setPopularEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopularEvents = async () => {
      try {
        // Assuming this endpoint returns events sorted by like count (descending)
        const response = await fetch(
          "http://localhost:6001/posts/popularEvents",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        setPopularEvents(data.events);
        console.log(data.events)
      } catch (error) {
        console.error("Error fetching popular events:", error);
      }
    };

    if (token) {
      fetchPopularEvents();
    }
  }, [token]);

  // Calculate pagination
  const totalPages = Math.ceil(popularEvents.length / eventsPerPage);
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = popularEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Popular Events
      </Typography>
      {/* Pagination Navigation */}
      {totalPages > 1 && (
        <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;
            return (
              <Button
                key={pageNumber}
                variant={pageNumber === currentPage ? "contained" : "outlined"}
                size="small"
                onClick={() => handlePageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            );
          })}
        </Box>
      )}
      <List>
        {currentEvents.length > 0 ? (
          currentEvents.map((event) => (
            <ListItem
              key={event._id}
              button
              onClick={() => navigate(`/events/${event._id}`)}
              sx={{ alignItems: "center" }}
            >
              {/* Render the event image if available */}
              {event.picturePath && (
                <Box
                  component="img"
                  src={`http://localhost:6001/assets/${event.picturePath}`}
                  alt={event.description}
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
                primary={event.description}
                secondary={`Likes: ${Object.keys(event.likes || {}).length}`}
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No popular events found.
          </Typography>
        )}
      </List>
    </Paper>
  );
};

export default PopularEventsWidget;
