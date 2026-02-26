import {
  ManageAccountsOutlined,
  EditOutlined,
  LocationOnOutlined,
  WorkOutlineOutlined,
  ChatOutlined,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  useTheme,
} from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import UserImage from "components/UserImage";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import { useSelector, useDispatch } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserWidget = ({ userId, picturePath }) => {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({
    firstName: "",
    lastName: "",
    location: "",
    occupation: "",
    pictureFile: null, // File upload
  });

  const { palette } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const dark = palette.neutral.dark;
  const medium = palette.neutral.medium;
  const main = palette.neutral.main;

  const loggedInUserId = useSelector((state) => state.user?._id);
  const loggedInUserRole = useSelector((state) => state.user.role);
  const role = useSelector((state) => state.user?.role);

  const getUser = useCallback(async () => {
    try {
      const response = await fetch(
        `https://campusconnect-backend.onrender.com/users/${userId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      setUser(data);

      setUpdatedUser({
        firstName: data.firstName,
        lastName: data.lastName,
        location: data.location || "",
        occupation: data.occupation || "",
        pictureFile: null,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }, [userId, token]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  if (!user) return null;

  const handleChange = (e) => {
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUpdatedUser({ ...updatedUser, pictureFile: file });
    }
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("firstName", updatedUser.firstName);
      formData.append("lastName", updatedUser.lastName);
      formData.append("location", updatedUser.location);
      formData.append("occupation", updatedUser.occupation);

      if (updatedUser.pictureFile) {
        formData.append("picture", updatedUser.pictureFile);
      }

      const response = await fetch(
        `https://campusconnect-backend.onrender.com/users/${userId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) throw new Error("Failed to update profile");

      const data = await response.json();
      setUser(data);
      dispatch({ type: "SET_USER", payload: data });
      setOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <WidgetWrapper>
      {/* FIRST ROW */}
      <FlexBetween gap="0.5rem" pb="1.1rem">
        <FlexBetween
          gap="1rem"
          onClick={() => navigate(`/profile/${userId}`)}
          sx={{ cursor: "pointer" }}
        >
          <UserImage image={user.picturePath} />
          <Box>
            <Typography variant="h4" color={dark} fontWeight="500">
              {user.firstName} {user.lastName}{" "}
              {/* Display Checkmark for Editors */}
              {/* Display checkmark next to the name if user is an editor */}
              {loggedInUserRole === "editor" && (
                <CheckCircleOutline sx={{ color: "blue", marginLeft: "8px" }} />
              )}
            </Typography>
            <Typography color={medium}>
              {user.friends.length} friends
            </Typography>
          </Box>
        </FlexBetween>

        {/* Edit Profile Button */}
        <FlexBetween gap="0.5rem">
          <IconButton
            onClick={() => setOpen(true)}
            disabled={userId !== loggedInUserId && role !== "admin"}
          >
            <ManageAccountsOutlined />
          </IconButton>
          {/* Message Button */}
          {userId !== loggedInUserId && (
            <IconButton onClick={() => navigate(`/chat/${userId}`)}>
              <ChatOutlined sx={{ color: main }} />
            </IconButton>
          )}
        </FlexBetween>
      </FlexBetween>

      <Divider />

      {/* SECOND ROW */}
      <Box p="1rem 0">
        <Box display="flex" alignItems="center" gap="1rem" mb="0.5rem">
          <LocationOnOutlined fontSize="large" sx={{ color: main }} />
          <Typography color={medium}>{user.location}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap="1rem">
          BIO
          <Typography color={medium}>{user.occupation}</Typography>
        </Box>
      </Box>

      <Divider />

      {/* FOURTH ROW */}

      {/* Profile Update Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={updatedUser.firstName}
            onChange={handleChange}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={updatedUser.lastName}
            onChange={handleChange}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={updatedUser.location}
            onChange={handleChange}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Bio"
            name="occupation"
            value={updatedUser.occupation}
            onChange={handleChange}
            margin="dense"
          />

          {/* Profile Picture Upload */}
          <Box mt={2}>
            {updatedUser.pictureFile && (
              <Box mb={2} display="flex" justifyContent="center">
                <img
                  src={URL.createObjectURL(updatedUser.pictureFile)}
                  alt="Selected"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                  }}
                />
              </Box>
            )}

            <Button variant="contained" component="label" fullWidth>
              Upload Profile Picture
              <input
                type="file"
                hidden
                accept="image/*"
                name="picture"
                onChange={handleFileChange}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdate} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </WidgetWrapper>
  );
};

export default UserWidget;
