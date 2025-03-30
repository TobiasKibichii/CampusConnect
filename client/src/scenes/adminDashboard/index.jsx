import React from "react";
import { Box, Typography } from "@mui/material";
import UserManagement from "./userManagement";
import GroupManagement from "./groupManagement";
import AnalyticsDashboard from "./analyticsDashboard";
import VenueAdmin from "./venueAdmin";

const AdminDashboard = () => {
  return (
    <Box p={2}>
      <Typography variant="h3" gutterBottom>
        Admin Dashboard
      </Typography>
      <UserManagement />
      {/* Future sections like Group Management, Analytics, etc. */}
      <GroupManagement />
      <AnalyticsDashboard />
      <VenueAdmin />
    </Box>
  );
};

export default AdminDashboard;
