import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Button,
  TextField
} from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, isSameDay } from "date-fns";


const DateFilteredEventsWidget = () => {
  const token = useSelector((state) => state.token);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();
  const [showFullText, setShowFullText] = useState(false);


  const stripHtmlAndTrim = (html, wordLimit = 10) => {
    const plainText = html.replace(/<[^>]+>/g, ""); // remove HTML tags
    const words = plainText.trim().split(/\s+/);
    if (words.length <= wordLimit) return plainText;
    return words.slice(0, wordLimit).join(" ") + "...";
  };



  // Fetch all events once (or you could fetch per date endpoint)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          "http://localhost:6001/posts/popularEvents",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        // assume data.events is array with eventDate field
        setEvents(data.events);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    if (token) fetchEvents();
  }, [token]);

  // Filter events by selectedDate
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.eventDate);
    return isSameDay(eventDate, selectedDate);
  });

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Events on {format(selectedDate, "MMMM do, yyyy")}
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DesktopDatePicker
          label="Select Date"
          inputFormat="MM/dd/yyyy"
          value={selectedDate}
          onChange={(newDate) => setSelectedDate(newDate)}
          renderInput={(params) => (
            <TextField {...params} fullWidth sx={{ mb: 2 }} />
          )}
        />
      </LocalizationProvider>

      {filteredEvents.length > 0 ? (
        <List>
          {filteredEvents.map((event) => (
            <ListItem
              key={event._id}
              button
              onClick={() => navigate(`/events/${event._id}`)}
              sx={{ alignItems: "center" }}
            >
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
                primary={
                  <>
                    {showFullText ? (
                      <span
                        dangerouslySetInnerHTML={{ __html: event.description }}
                      />
                    ) : (
                      stripHtmlAndTrim(event.description)
                    )}
                    {event.description.replace(/<[^>]+>/g, "").split(" ")
                      .length > 10 && (
                      <Typography
                        variant="body2"
                        color="primary"
                        component="span"
                        sx={{ cursor: "pointer", ml: 1 }}
                        onClick={() => setShowFullText(!showFullText)}
                      >
                        {showFullText ? " Show less" : " Show more"}
                      </Typography>
                    )}
                  </>
                }
                secondary={`Likes: ${Object.keys(event.likes || {}).length}`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="textSecondary">
          No events scheduled on this date.
        </Typography>
      )}
    </Paper>
  );
};

export default DateFilteredEventsWidget;
