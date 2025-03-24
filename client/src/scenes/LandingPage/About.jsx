import React from "react";
import { Box, Container, Typography, useTheme } from "@mui/material";

const AboutSection = () => {
  const theme = useTheme();
  const lightBlue = "#66ccff"; // Consistent with your landing page accent

  return (
    <Box
      id="about"
      sx={{ py: "4rem", backgroundColor: theme.palette.background.default }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{ color: lightBlue, mb: 2 }}
        >
          About Campus Connect
        </Typography>
        <Typography
          variant="body1"
          align="center"
          sx={{ color: theme.palette.text.primary, mb: 2 }}
        >
          Campus Connect is a cutting-edge digital platform designed to unite
          campus communities. Our mission is to streamline communications and
          event management, ensuring that every member of your community stays
          informed, connected, and engaged.
        </Typography>
        <Typography
          variant="body1"
          align="center"
          sx={{ color: theme.palette.text.primary }}
        >
          Whether you're a student seeking engaging events, a faculty member
          sharing expertise, or an administrator coordinating campus activities,
          Campus Connect is built to elevate your campus experience.
        </Typography>
      </Container>
    </Box>
  );
};

export default AboutSection;
