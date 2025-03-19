import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";

const SearchResults = () => {
  // Extract query parameters from the URL
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const query = queryParams.get("q") || "";
  const role = queryParams.get("role") || "";

  // State for search results, loading indicator, and errors
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);    
  const token = useSelector((state) => state.token);

  useEffect(() => {
    if (query.trim() !== "") {
      setLoading(true);
      const url = `http://localhost:6001/search?q=${encodeURIComponent(
        query
      )}${role ? `&role=${encodeURIComponent(role)}` : ""}`;
      console.log("Constructed URL:", url);

      fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          console.log("Response status:", res.status);
          if (!res.ok) {
            // Log detailed error information and then throw an error.
            throw new Error(
              `Failed to fetch search results. Status: ${res.status} ${res.statusText}`
            );
          }
          return res.json();
        })
        .then((data) => {
          console.log("Fetched data:", data);
          setResults(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          setError(err.message);
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
      ) : results.length === 0 ? (
        <Typography>No results found.</Typography>
      ) : (
        results.map((user) => (
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
        ))
      )}
    </Box>
  );
};

export default SearchResults;
