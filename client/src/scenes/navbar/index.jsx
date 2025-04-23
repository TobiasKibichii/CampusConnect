import { useState, useEffect, useRef } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Typography,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  useMediaQuery,
  Button,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Badge,
  InputBase as MuiInputBase,
} from "@mui/material";
import {
  Search,
  Message,
  DarkMode,
  LightMode,
  Notifications,
  Help,
  Menu,
  Close,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setMode, setLogout } from "state";
import { useNavigate } from "react-router-dom";
import FlexBetween from "components/FlexBetween";
import axios from "axios";

// Debounce hook to limit API calls while typing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const Navbar = () => {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Changed liveResults to be an object with two properties: posts and users.
  const [liveResults, setLiveResults] = useState({ posts: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [open, setOpen] = useState(false);

  // Separate state for message notifications and general notifications
  const [messageNotificationCount, setMessageNotificationCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const background = theme.palette.background.default;
  const primaryLight = theme.palette.primary.light;
  const alt = theme.palette.background.alt;

  const fullName = `${user.firstName} ${user.lastName}`;

  // For positioning the search popper
  const inputRef = useRef(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Live search effect: calls two endpoints for posts and users on your AI backend (port 5000)
  useEffect(() => {
   if (debouncedSearchQuery.trim() !== "") {
     setLoading(true);
     setSearchError("");

     const postsEndpoint = `http://localhost:8000/search?query=${encodeURIComponent(
       debouncedSearchQuery
     )}&type=posts`;
     const usersEndpoint = `http://localhost:8000/search?query=${encodeURIComponent(
       debouncedSearchQuery
     )}&type=users`;

     Promise.all([
       axios.get(postsEndpoint, { headers: { /* … */ } }),
       axios.get(usersEndpoint, { headers: { /* … */ } }),
     ])
       .then(([postsResponse, usersResponse]) => {
      setLiveResults({
        posts: postsResponse.data.results || [],
        users: usersResponse.data.results || [],
      });
       setLiveResults({
        posts: (postsResponse.data.results || []).map(r => ({ ...r, __type: "posts" })),
         users: (usersResponse.data.results || []).map(u => ({ ...u, __type: "users" })),
});
         setLoading(false);
         setOpen(true);
       })
       .catch((err) => { /* … */ });
   } else {
     setLiveResults({ posts: [], users: [] });
     setOpen(false);
   }
 }, [debouncedSearchQuery, token]);

 const handleResultClick = (result) => {
  setOpen(false);
  if (result.__type === "users") {
    navigate(`/profile/${result._id}`);
  } else {
    // for your posts/events routes
    // pick whichever you prefer: /posts or /events
    navigate(`/posts/${result._id}`);
  }
};

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const markAsRead = async () => {
    console.log("🚀 markAsRead HIT");
    try {
      await axios.put(
        "http://localhost:6001/notifications/markAsRead",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotificationsCount(0);
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  // Fetch general notifications count from the backend
  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:6001/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          // Assuming response.data is an array of notifications
          setNotificationsCount(response.data.filter((n) => !n.read).length);
        })
        .catch((err) => {
          console.error("Error fetching notifications:", err);
        });
    }
  }, [token]);

  // Fetch message notifications count from the backend
  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:6001/messageNotifications", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          // Assuming response.data is an array of message notifications
          setMessageNotificationCount(response.data.length);
        })
        .catch((err) => {
          console.error("Error fetching message notifications:", err);
        });
    }
  }, [token]);

  return (
    <FlexBetween padding="1rem 6%" backgroundColor={alt}>
      {/* LEFT SIDE: Site Title and Search */}
      <FlexBetween gap="1.75rem">
        <Typography
          fontWeight="bold"
          fontSize="clamp(1rem, 2rem, 2.25rem)"
          color="primary"
          onClick={() => navigate("/home")}
          sx={{
            "&:hover": {
              color: primaryLight,
              cursor: "pointer",
            },
          }}
        >
          CampusConnect
        </Typography>
        {isNonMobileScreens && (
          <Box position="relative">
            <FlexBetween
              backgroundColor={neutralLight}
              borderRadius="9px"
              gap="3rem"
              padding="0.1rem 1.5rem"
            >
              <InputBase
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                ref={inputRef}
              />
              <IconButton onClick={handleSearch}>
                <Search />
              </IconButton>
            </FlexBetween>
            <Popper
              open={open}
              anchorEl={inputRef.current}
              placement="bottom-start"
              style={{ zIndex: 1200 }}
            >
              <Paper
                style={{
                  width: inputRef.current ? inputRef.current.clientWidth : 300,
                  maxHeight: 300,
                  overflowY: "auto",
                }}
              >
                {loading && (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    padding="1rem"
                  >
                    <CircularProgress size={24} />
                  </Box>
                )}
                {!loading &&
                  liveResults.posts.length === 0 &&
                  liveResults.users.length === 0 &&
                  debouncedSearchQuery && (
                    <Typography style={{ padding: "1rem" }}>
                      No results found
                    </Typography>
                  )}
                <List>
                  {liveResults.posts.length > 0 && (
                    <>
                      <Typography
                        variant="subtitle1"
                        style={{ padding: "0.5rem 1rem" }}
                      >
                        Events/Posts
                      </Typography>
                      {liveResults.posts.map((result) => (
                        <ListItem
                          button
                          key={result._id}
                          onClick={() => handleResultClick(result)}
                        >
                          <ListItemText
                            primary={
                              result.title || result.description || "Untitled"
                            }
                          />
                        </ListItem>
                      ))}
                    </>
                  )}
                  {liveResults.users.length > 0 && (
                    <>
                      <Typography
                        variant="subtitle1"
                        style={{ padding: "0.5rem 1rem" }}
                      >
                        Users
                      </Typography>
                      {liveResults.users.map((user) => (
                        <ListItem
                          button
                          key={user._id}
                          onClick={() => handleResultClick(user)}
                        >
                          <ListItemText
                            primary={`${user.firstName} ${user.lastName}`}
                            secondary={user.email}
                          />
                        </ListItem>
                      ))}
                    </>
                  )}
                </List>
              </Paper>
            </Popper>
            {searchError && (
              <Typography color="error" variant="caption">
                {searchError}
              </Typography>
            )}
          </Box>
        )}
      </FlexBetween>

      {/* RIGHT SIDE: Navigation Icons */}
      {isNonMobileScreens ? (
        <FlexBetween gap="2rem">
          <IconButton onClick={() => dispatch(setMode())}>
            {theme.palette.mode === "dark" ? (
              <DarkMode sx={{ fontSize: "25px" }} />
            ) : (
              <LightMode sx={{ color: dark, fontSize: "25px" }} />
            )}
          </IconButton>
          {/* Message Icon with its own Badge */}
          <IconButton
            onClick={() => {
              setMessageNotificationCount(0);
              navigate("/messages");
            }}
          >
            <Badge badgeContent={messageNotificationCount} color="error">
              <Message sx={{ fontSize: "25px", cursor: "pointer" }} />
            </Badge>
          </IconButton>
          {/* General Notifications Icon with separate Badge */}
          <IconButton
            onClick={async () => {
              console.log("🔔 Notification icon clicked");
              await markAsRead();
              navigate("/notifications");
            }}
          >
            <Badge badgeContent={notificationsCount} color="error">
              <Notifications sx={{ fontSize: "25px", cursor: "pointer" }} />
            </Badge>
          </IconButton>

          <Button
            onClick={() => {
              navigate("/registeredEvents");
            }}
            sx={{
              color: dark,
              backgroundColor: neutralLight,
              borderRadius: "0.25rem",
              textTransform: "none",
              fontWeight: "bold",
              padding: "0.5rem 1rem",
            }}
          >
            Registered Events
          </Button>

          {user && user.role === "admin" && (
            <Button
              onClick={() => navigate("/admin")}
              sx={{
                color: dark,
                backgroundColor: neutralLight,
                borderRadius: "0.25rem",
                textTransform: "none",
                fontWeight: "bold",
                padding: "0.5rem 1rem",
              }}
            >
              Admin Dashboard
            </Button>
          )}
          {user && user.role === "editor" && (
            <Button
              onClick={() => navigate("/editor")}
              sx={{
                color: dark,
                backgroundColor: neutralLight,
                borderRadius: "0.25rem",
                textTransform: "none",
                fontWeight: "bold",
                padding: "0.5rem 1rem",
              }}
            >
              Editor Dashboard
            </Button>
          )}
          <FormControl variant="standard" value={fullName}>
            <Select
              value={fullName}
              sx={{
                backgroundColor: neutralLight,
                width: "150px",
                borderRadius: "0.25rem",
                p: "0.25rem 1rem",
                "& .MuiSvgIcon-root": {
                  pr: "0.25rem",
                  width: "3rem",
                },
                "& .MuiSelect-select:focus": {
                  backgroundColor: neutralLight,
                },
              }}
              input={<MuiInputBase />}
            >
              <MenuItem value={fullName}>
                <Typography>{fullName}</Typography>
              </MenuItem>
              <MenuItem onClick={() => dispatch(setLogout())}>Log Out</MenuItem>
            </Select>
          </FormControl>
        </FlexBetween>
      ) : (
        <IconButton
          onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
        >
          <Menu />
        </IconButton>
      )}

      {/* MOBILE NAV */}
      {!isNonMobileScreens && isMobileMenuToggled && (
        <Box
          position="fixed"
          right="0"
          bottom="0"
          height="100%"
          zIndex="10"
          maxWidth="500px"
          minWidth="300px"
          backgroundColor={background}
        >
          <Box display="flex" justifyContent="flex-end" p="1rem">
            <IconButton
              onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
            >
              <Close />
            </IconButton>
          </Box>
          <FlexBetween
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap="3rem"
          >
            {/* MOBILE NAV ICONS HERE */}
          </FlexBetween>
        </Box>
      )}
    </FlexBetween>
  );
};

export default Navbar;
