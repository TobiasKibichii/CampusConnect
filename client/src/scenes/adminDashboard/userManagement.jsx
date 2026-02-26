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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { useSelector } from "react-redux";

const UserManagement = () => {
  const currentUser = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for search and filter inputs
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // States for deletion confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // States for edit dialog
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");

  // States for snackbar notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // "success" or "error"

  // Fetch users on component mount if current user is an admin
  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetch("https://campusconnect-backend.onrender.com/admin/users", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch users");
          }
          return res.json();
        })
        .then((data) => {
          setUsers(data.users || []);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [currentUser, token]);

  // Open confirmation dialog when delete button is clicked
  const handleDeleteClick = (userId) => {
    setSelectedUserId(userId);
    setOpenDeleteDialog(true);
  };

  // Confirm deletion, then call the DELETE endpoint
  const confirmDeleteUser = () => {
    fetch(
      `https://campusconnect-backend.onrender.com/admin/users/${selectedUserId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete user");
        }
        return res.json();
      })
      .then(() => {
        setUsers((prev) => prev.filter((user) => user._id !== selectedUserId));
        setSnackbarMessage("User deleted successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((err) => {
        console.error("Delete error:", err);
        setSnackbarMessage("Failed to delete user");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      })
      .finally(() => {
        setOpenDeleteDialog(false);
        setSelectedUserId(null);
      });
  };

  // Open the edit dialog and pre-fill the selected user's details
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditFirstName(user.firstName);
    setEditLastName(user.lastName);
    setEditEmail(user.email);
    setEditRole(user.role);
    setOpenEditDialog(true);
  };

  // Confirm user update by calling the PATCH endpoint
  const confirmEditUser = () => {
    fetch(
      `https://campusconnect-backend.onrender.com/admin/users/${selectedUser._id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          firstName: editFirstName,
          lastName: editLastName,
          email: editEmail,
          role: editRole,
        }),
      },
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to update user");
        }
        return res.json();
      })
      .then((updatedUser) => {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === updatedUser._id ? updatedUser : user,
          ),
        );
        setSnackbarMessage("User updated successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((err) => {
        console.error("Edit error:", err);
        setSnackbarMessage("Failed to update user");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      })
      .finally(() => {
        setOpenEditDialog(false);
        setSelectedUser(null);
      });
  };

  // Cancel deletion
  const cancelDelete = () => {
    setOpenDeleteDialog(false);
    setSelectedUserId(null);
  };

  // Compute filtered users based on search query and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  if (loading) return <Typography>Loading...</Typography>;
  if (error)
    return <Typography color="error">Error fetching users: {error}</Typography>;

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>

      {/* Search and Filter Controls */}
      <Box display="flex" gap="1rem" mb="1rem" flexWrap="wrap">
        <TextField
          label="Search Users"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FormControl variant="outlined" size="small">
          <InputLabel id="role-filter-label">Role</InputLabel>
          <Select
            labelId="role-filter-label"
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ minWidth: "120px" }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="editor">Editor</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table aria-label="users table">
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user._id}</TableCell>
                <TableCell>
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEditClick(user)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleDeleteClick(user._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={cancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this user? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteUser} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap="1rem" mt={1}>
            <TextField
              label="First Name"
              variant="outlined"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Last Name"
              variant="outlined"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Email"
              variant="outlined"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              fullWidth
            />
            <FormControl fullWidth variant="outlined">
              <InputLabel id="edit-role-label">Role</InputLabel>
              <Select
                labelId="edit-role-label"
                label="Role"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="editor">Editor</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmEditUser} color="secondary">
            Save
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

export default UserManagement;
