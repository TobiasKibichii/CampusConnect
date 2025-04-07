import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const EditorDashboard = () => {
  const token = useSelector((state) => state.token);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // States for join request and member management notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Dialog for confirming member removal
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  // Fetch group details on mount
  useEffect(() => {
    fetch("http://localhost:6001/editor/group", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch group");
        return res.json();
      })
      .then((data) => {
        setGroup(data.group);
        setEditName(data.group.name);
        setEditDescription(data.group.description || "");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  // Handler to update group details
  const handleUpdateGroup = () => {
    fetch("http://localhost:6001/editor/group", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: editName, description: editDescription }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update group");
        return res.json();
      })
      .then((data) => {
        setGroup(data.group);
        setSnackbarMessage("Group updated successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((err) => {
        setSnackbarMessage(err.message);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  // Approve join request for a user
  const handleApproveJoin = (userId) => {
    fetch(`http://localhost:6001/editor/group/approve-join/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to approve join request");
        return res.json();
      })
      .then((data) => {
        setGroup(data.group);
        setSnackbarMessage("Join request approved");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((err) => {
        setSnackbarMessage(err.message);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });


      
  };

  // Reject join request for a user
  const handleRejectJoin = (userId) => {
    fetch(`http://localhost:6001/editor/group/reject-join/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to reject join request");
        return res.json();
      })
      .then((data) => {
        setGroup(data.group);
        setSnackbarMessage("Join request rejected");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((err) => {
        setSnackbarMessage(err.message);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  // Open dialog to confirm member removal
  const handleRemoveMemberClick = (memberId) => {
    setSelectedMemberId(memberId);
    setOpenRemoveDialog(true);
  };

  // Confirm removal of a group member
  const confirmRemoveMember = () => {
    fetch(`http://localhost:6001/editor/group/members/${selectedMemberId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to remove member");
        return res.json();
      })
      .then((data) => {
        setGroup(data.group);
        setSnackbarMessage("Member removed successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((err) => {
        setSnackbarMessage(err.message);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      })
      .finally(() => {
        setOpenRemoveDialog(false);
        setSelectedMemberId(null);
      });
  };

  const cancelRemoveMember = () => {
    setOpenRemoveDialog(false);
    setSelectedMemberId(null);
  };

  if (loading) return <Typography>Loading group data...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Editor Dashboard - Manage Your Group
      </Typography>

      {/* Group Details Editing */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Group Details</Typography>
        <TextField
          label="Group Name"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          fullWidth
          sx={{ mb: 2, mt: 1 }}
        />
        <TextField
          label="Description"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleUpdateGroup}>
          Update Group
        </Button>
      </Paper>

      {/* Display Group Members */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Group Members
        </Typography>
        {group.members && group.members.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Member ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Remove</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {group.members.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell>{member._id}</TableCell>
                    <TableCell>
                      {member.firstName} {member.lastName}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleRemoveMemberClick(member._id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>No members in your group.</Typography>
        )}
      </Paper>

      {/* Display Join Requests */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Join Requests
        </Typography>
        {group.joinRequests && group.joinRequests.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Request ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {group.joinRequests.map((reqUser) => (
                  <TableRow key={reqUser._id}>
                    <TableCell>{reqUser._id}</TableCell>
                    <TableCell>
                      {reqUser.firstName} {reqUser.lastName}
                    </TableCell>
                    <TableCell>{reqUser.email}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleApproveJoin(reqUser._id)}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleRejectJoin(reqUser._id)}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>No join requests pending.</Typography>
        )}
      </Paper>

      {/* Dialog for Removing Member */}
      <Dialog open={openRemoveDialog} onClose={cancelRemoveMember}>
        <DialogTitle>Confirm Member Removal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this member from your group? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelRemoveMember} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmRemoveMember} color="secondary">
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
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

export default EditorDashboard;
