import { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

const FollowEditorsPage = () => {
  const [editors, setEditors] = useState([]);
  const [selectedEditors, setSelectedEditors] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Retrieve user and token from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || !user._id) {
      enqueueSnackbar("No user found. Redirecting to login.", {
        variant: "error",
      });
      navigate("/login");
      return;
    }

    const fetchEditors = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://campusconnect-backend.onrender.com/users/editors",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setEditors(response.data);
      } catch (err) {
        enqueueSnackbar("Failed to load editors.", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchEditors();
  }, [token, navigate, enqueueSnackbar]);

  const handleEditorChange = (event) => {
    const { value } = event.target;
    setSelectedEditors(typeof value === "string" ? value.split(",") : value);
  };

  const handleSubmit = async () => {
    if (selectedEditors.length < 5) {
      enqueueSnackbar("Please select at least 5 editors.", {
        variant: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        "https://campusconnect-backend.onrender.com/users/followEditors",
        { userId: user._id, editors: selectedEditors },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      enqueueSnackbar("Editors followed successfully!", { variant: "success" });
      navigate("/home");
    } catch (err) {
      enqueueSnackbar("Error updating followed editors.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p="2rem">
      <Typography variant="h4" mb="1rem">
        Follow at least 5 University Groups/Clubs
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="editors-label">Select Groups</InputLabel>
            <Select
              labelId="editors-label"
              multiple
              value={selectedEditors}
              onChange={handleEditorChange}
              input={<OutlinedInput label="Select Editors" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((id) => {
                    const editor = editors.find((ed) => ed._id === id);
                    return (
                      <Chip
                        key={id}
                        label={
                          editor ? `${editor.firstName} ${editor.lastName}` : id
                        }
                      />
                    );
                  })}
                </Box>
              )}
            >
              {editors.map((editor) => (
                <MenuItem key={editor._id} value={editor._id}>
                  {editor.firstName} {editor.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={selectedEditors.length < 5 || loading}
          >
            {loading ? <CircularProgress size={24} /> : "Save and Continue"}
          </Button>
        </>
      )}
    </Box>
  );
};

export default FollowEditorsPage;
