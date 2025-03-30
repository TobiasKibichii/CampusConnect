import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const VenueAdmin = () => {
  const currentUser = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for deletion confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState(null);

  // States for snackbar notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // States for adding a new venue
  const [newVenueName, setNewVenueName] = useState("");
  const [newVenueCapacity, setNewVenueCapacity] = useState("");

  // Fetch venues from the backend when the component mounts
  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetch("http://localhost:6001/admin/venues", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch venues");
          }
          return res.json();
        })
        .then((data) => {
          setVenues(data.venues || []);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [currentUser, token]);

  // Open the confirmation dialog when "Delete" is clicked
  const handleDeleteClick = (venueId) => {
    setSelectedVenueId(venueId);
    setOpenDeleteDialog(true);
  };

  // Send DELETE request to backend and update state
  const confirmDeleteVenue = () => {
    fetch(`http://localhost:6001/admin/venues/${selectedVenueId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete venue");
        }
        return res.json();
      })
      .then(() => {
        setVenues((prev) =>
          prev.filter((venue) => venue._id !== selectedVenueId)
        );
        setSnackbarMessage("Venue deleted successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((err) => {
        console.error("Delete error:", err);
        setSnackbarMessage("Failed to delete venue");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      })
      .finally(() => {
        setOpenDeleteDialog(false);
        setSelectedVenueId(null);
      });
  };

  // Cancel deletion and close the dialog
  const cancelDelete = () => {
    setOpenDeleteDialog(false);
    setSelectedVenueId(null);
  };

  // Handle adding a new venue
  const handleAddVenue = (e) => {
    e.preventDefault();
    const payload = {
      name: newVenueName,
      capacity: Number(newVenueCapacity),
    };

    fetch("http://localhost:6001/admin/venues", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to add venue");
        }
        return res.json();
      })
      .then((data) => {
        setVenues((prev) => [...prev, data.venue]);
        setSnackbarMessage("Venue added successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setNewVenueName("");
        setNewVenueCapacity("");
      })
      .catch((err) => {
        console.error("Add venue error:", err);
        setSnackbarMessage("Failed to add venue");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Venue Management
      </Typography>

      {/* Form to add a new venue */}
      <Box component="form" onSubmit={handleAddVenue} mb={2}>
        <Typography variant="h6">Add New Venue</Typography>
        <Box display="flex" gap={2} mt={1} flexWrap="wrap">
          <TextField
            label="Venue Name"
            value={newVenueName}
            onChange={(e) => setNewVenueName(e.target.value)}
            required
          />
          <TextField
            label="Capacity"
            type="number"
            value={newVenueCapacity}
            onChange={(e) => setNewVenueCapacity(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary">
            Add Venue
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table aria-label="venues table">
          <TableHead>
            <TableRow>
              <TableCell>Venue ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Availability</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {venues.map((venue) => (
              <TableRow key={venue._id}>
                <TableCell>{venue._id}</TableCell>
                <TableCell>{venue.name}</TableCell>
                <TableCell>{venue.capacity}</TableCell>
                <TableCell>
                  {venue.available ? "Available" : "Booked"}
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleDeleteClick(venue._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {venues.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No venues found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog for Deletion */}
      <Dialog open={openDeleteDialog} onClose={cancelDelete}>
        <DialogTitle>Confirm Venue Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this venue? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteVenue} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VenueAdmin;
