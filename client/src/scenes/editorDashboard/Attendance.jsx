import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Checkbox,
  Button,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Divider,
} from "@mui/material";
import { useSelector } from "react-redux";

const Attendance = () => {
  const token = useSelector((state) => state.token);
  const userId = useSelector((state) => state.user._id);
  const [events, setEvents] = useState([]);
  const [checked, setChecked] = useState({});
  const [eventVisibility, setEventVisibility] = useState({}); // Toggle visibility of each event

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await fetch(
        `https://campusconnect-backend.onrender.com/posts/editor/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setEvents(data);
    };

    fetchEvents();
  }, [token, userId]);

  const handleToggle = (eventId, attendeeId) => {
    setChecked((prev) => ({
      ...prev,
      [eventId]: prev[eventId]
        ? prev[eventId].includes(attendeeId)
          ? prev[eventId].filter((id) => id !== attendeeId)
          : [...prev[eventId], attendeeId]
        : [attendeeId],
    }));
  };

  const handleSubmitAttendance = async (eventId) => {
    try {
      await fetch(`http://localhost:6001/posts/${eventId}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attendees: checked[eventId] || [],
        }),
      });
      alert("Attendance submitted!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit attendance");
    }
  };

  const toggleEventVisibility = (eventId) => {
    setEventVisibility((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  return (
    <Box p="2rem">
      <Typography variant="h4" gutterBottom>
        Attendance
      </Typography>

      {/* Event Grouping Section */}
      {events.map((event) => (
        <Box key={event._id} mb="2rem">
          {/* Event Title */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            onClick={() => toggleEventVisibility(event._id)}
            sx={{ cursor: "pointer" }}
          >
            <Typography variant="h6">{event.description}</Typography>
            <Button variant="outlined">
              {eventVisibility[event._id] ? "Hide" : "Show"} Attendees
            </Button>
          </Box>

          {/* Collapsible Section for the Event Details */}
          <Collapse in={eventVisibility[event._id]}>
            <Box p="1rem" border="1px solid #ccc" borderRadius="8px">
              {/* Number of Attendees */}
              <Typography>Total Attendees: {event.attendees.length}</Typography>

              {/* Dropdown Checklist for selecting attendees */}
              <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
                <InputLabel id={`attendee-label-${event._id}`}>
                  Select Attendees
                </InputLabel>
                <Select
                  labelId={`attendee-label-${event._id}`}
                  multiple
                  value={checked[event._id] || []}
                  onChange={(e) => {
                    const selectedAttendees = e.target.value;
                    setChecked((prev) => ({
                      ...prev,
                      [event._id]: selectedAttendees,
                    }));
                  }}
                  renderValue={(selected) => selected.join(", ")}
                >
                  {event.attendees.map((attendee) => (
                    <MenuItem key={attendee._id} value={attendee._id}>
                      <Checkbox
                        checked={checked[event._id]?.includes(attendee._id)}
                      />
                      {attendee.firstName} {attendee.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Updated Attendee Count */}
              <Typography mt={2}>
                Attending: {event.presentCount} / {event.attendees.length}
              </Typography>

              {/* Submit Attendance Button */}
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSubmitAttendance(event._id)}
                sx={{ mt: 2 }}
              >
                Submit Attendance
              </Button>
            </Box>
          </Collapse>
          <Divider sx={{ my: 2 }} />
        </Box>
      ))}
    </Box>
  );
};

export default Attendance;
