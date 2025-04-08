import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";
import axios from "axios";

const SearchResults = () => {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const query = queryParams.get("q") || "";
  const role = queryParams.get("role") || "";

  const [results, setResults] = useState({ users: [], ai: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.token);

  useEffect(() => {
    if (query.trim() !== "") {
      setLoading(true);
      setError(null);

      // AI Search Request
      const aiUrl = `http://localhost:5000/search?q=${encodeURIComponent(
        query
      )}${role ? `&role=${encodeURIComponent(role)}` : ""}`;

      // User Search Request
      const userUrl = `http://localhost:6001/api/search-users?q=${encodeURIComponent(
        query
      )}${role ? `&role=${encodeURIComponent(role)}` : ""}`;

      // Perform both searches
      Promise.all([
        axios.get(aiUrl, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(userUrl, { headers: { Authorization: `Bearer ${token}` } }),
      ])
        .then(([aiResponse, userResponse]) => {
          setResults({
            ai: aiResponse.data.results || [],
            users: userResponse.data || [],
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error during search:", err);
          setError("Failed to fetch search results.");
          setLoading(false);
        });
    }
  }, [query, role, token]);

  return (
    <Box p="2rem">
      <Typography variant="h4" mb="1rem">
        Search Results for &ldquo;{query}&rdquo;
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          {/* AI Search Results */}
          {results.ai.length > 0 && (
            <Box mb="2rem">
              <Typography variant="h5">
                AI Search Results (Events/Clubs)
              </Typography>
              {results.ai.map((result, index) => (
                <Box key={index} p="1rem" borderBottom="1px solid #ccc">
                  <Typography variant="h6">{result}</Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* User Search Results */}
          {results.users.length > 0 && (
            <Box>
              <Typography variant="h5">User Search Results</Typography>
              {results.users.map((user) => (
                <Box key={user._id} p="1rem" borderBottom="1px solid #ccc">
                  <Typography variant="h6">
                    {user.fullName} ({user.username})
                  </Typography>
                  <Typography variant="body2">
                    {user.bio || "No bio available."}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Role: {user.role}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* If No Results */}
          {results.ai.length === 0 &&
            results.users.length === 0 &&
            !loading && <Typography>No results found.</Typography>}
        </>
      )}
    </Box>
  );
};

export default SearchResults;
