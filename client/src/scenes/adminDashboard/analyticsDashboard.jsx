// AnalyticsDashboard.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { useSelector } from "react-redux";

const AnalyticsDashboard = () => {
  const token = useSelector((state) => state.token);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://campusconnect-backend.onrender.com/admin/analytics", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error fetching analytics");
        }
        return res.json();
      })
      .then((data) => {
        setAnalytics(data.analytics);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  if (loading) return <Typography>Loading analytics...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Analytics & Reporting
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={{ padding: 16 }}>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h4">{analytics.totalUsers}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={{ padding: 16 }}>
            <Typography variant="h6">Total Groups</Typography>
            <Typography variant="h4">{analytics.totalGroups}</Typography>
          </Paper>
        </Grid>
        {analytics.totalPosts !== undefined && (
          <Grid item xs={12} md={4}>
            <Paper elevation={3} style={{ padding: 16 }}>
              <Typography variant="h6">Total Posts</Typography>
              <Typography variant="h4">{analytics.totalPosts}</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;
