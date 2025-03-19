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
  const [liveResults, setLiveResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token); // Adjust if your token is stored elsewhere
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const background = theme.palette.background.default;
  const primaryLight = theme.palette.primary.light;
  const alt = theme.palette.background.alt;

  const fullName = `${user.firstName} ${user.lastName}`;

  // For positioning the pop-up
  const inputRef = useRef(null);
  // Debounce the search query (500ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // useEffect to perform live search on debounced query change
  useEffect(() => {
    if (debouncedSearchQuery.trim() !== "") {
      setLoading(true);
      axios
        .get(
          `http://localhost:6001/search?q=${encodeURIComponent(
            debouncedSearchQuery
          )}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          setLiveResults(response.data);
          setLoading(false);
          setOpen(true);
        })
        .catch((err) => {
          console.error("Live search error:", err);
          setSearchError("Error fetching search results");
          setLoading(false);
          setOpen(false);
        });
    } else {
      setLiveResults([]);
      setOpen(false);
    }
  }, [debouncedSearchQuery, token]);

  // Handle clicking on a search result (for example, navigate to the user's profile)
  const handleResultClick = (result) => {
    setOpen(false);
    navigate(`/profile/${result._id}`);
  };

  // Optional: a handler to manually trigger search navigation if needed
  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

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
                inputRef={inputRef}
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
                  liveResults.length === 0 &&
                  debouncedSearchQuery && (
                    <Typography style={{ padding: "1rem" }}>
                      No results found
                    </Typography>
                  )}
                <List>
                  {liveResults.map((result) => (
                    <ListItem
                      button
                      key={result._id}
                      onClick={() => handleResultClick(result)}
                    >
                      <ListItemText
                        primary={`${result.firstName} ${result.lastName}`}
                        secondary={result.email}
                      />
                    </ListItem>
                  ))}
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
          <Message sx={{ fontSize: "25px" }} />
          <Notifications sx={{ fontSize: "25px" }} />
          <Help sx={{ fontSize: "25px" }} />
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
              input={<InputBase />}
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
            <IconButton
              onClick={() => dispatch(setMode())}
              sx={{ fontSize: "25px" }}
            >
              {theme.palette.mode === "dark" ? (
                <DarkMode sx={{ fontSize: "25px" }} />
              ) : (
                <LightMode sx={{ color: dark, fontSize: "25px" }} />
              )}
            </IconButton>
            <Message sx={{ fontSize: "25px" }} />
            <Notifications sx={{ fontSize: "25px" }} />
            <Help sx={{ fontSize: "25px" }} />
            {user && user.role === "admin" && (
              <Button
                onClick={() => {
                  setIsMobileMenuToggled(false);
                  navigate("/admin");
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
                Admin Dashboard
              </Button>
            )}
            {user && user.role === "editor" && (
              <Button
                onClick={() => {
                  setIsMobileMenuToggled(false);
                  navigate("/editor");
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
                input={<InputBase />}
              >
                <MenuItem value={fullName}>
                  <Typography>{fullName}</Typography>
                </MenuItem>
                <MenuItem onClick={() => dispatch(setLogout())}>
                  Log Out
                </MenuItem>
              </Select>
            </FormControl>
          </FlexBetween>
        </Box>
      )}
    </FlexBetween>
  );
};

export default Navbar;
