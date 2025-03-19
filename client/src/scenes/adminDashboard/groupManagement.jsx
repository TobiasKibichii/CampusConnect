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
} from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const GroupManagement = () => {
  const currentUser = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for deletion confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // States for snackbar notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Fetch groups from the backend when the component mounts
  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetch("http://localhost:6001/admin/groups", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch groups");
          }
          return res.json();
        })
        .then((data) => {
          setGroups(data.groups || []);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [currentUser, token]);

  // Open the confirmation dialog when "Delete" is clicked
  const handleDeleteClick = (groupId) => {
    setSelectedGroupId(groupId);
    setOpenDeleteDialog(true);
  };

  // Send DELETE request to backend and update state
  const confirmDeleteGroup = () => {
    fetch(`http://localhost:6001/admin/groups/${selectedGroupId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete group");
        }
        return res.json();
      })
      .then(() => {
        setGroups((prev) =>
          prev.filter((group) => group._id !== selectedGroupId)
        );
        setSnackbarMessage("Group deleted successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((err) => {
        console.error("Delete error:", err);
        setSnackbarMessage("Failed to delete group");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      })
      .finally(() => {
        setOpenDeleteDialog(false);
        setSelectedGroupId(null);
      });
  };

  // Cancel deletion and close the dialog
  const cancelDelete = () => {
    setOpenDeleteDialog(false);
    setSelectedGroupId(null);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Group Management
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="groups table">
          <TableHead>
            <TableRow>
              <TableCell>Group ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Member Count</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group._id}>
                <TableCell>{group._id}</TableCell>
                <TableCell>{group.name}</TableCell>
                <TableCell>{group.createdBy}</TableCell>
                <TableCell>
                  {group.members ? group.members.length : 0}
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleDeleteClick(group._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {groups.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No groups found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog for Deletion */}
      <Dialog open={openDeleteDialog} onClose={cancelDelete}>
        <DialogTitle>Confirm Group Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this group? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteGroup} color="secondary">
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

export default GroupManagement;
