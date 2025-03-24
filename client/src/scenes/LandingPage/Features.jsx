import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const FeaturesSection = () => {
  const theme = useTheme();
  const lightBlue = "#66ccff"; // Consistent with LandingPage

  return (
    <Box
      id="features"
      sx={{ py: "4rem", backgroundColor: theme.palette.background.default }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{ color: lightBlue, mb: 3, fontWeight: "bold" }}
        >
          Features
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {[
            {
              title: "Seamless Event Management",
              description:
                "Discover, join, and manage campus events effortlessly. Stay updated with event details, RSVP seamlessly, and receive real-time notifications directly on your device.",
            },
            {
              title: "Real-Time Notifications",
              description:
                "Never miss an important update. Receive instant alerts for campus news, event changes, and messages to keep you informed at all times.",
            },
            {
              title: "Collaborative Communication",
              description:
                "Engage in vibrant discussions and connect with peers through our integrated messaging system and group forums. Share ideas, offer feedback, and collaborate seamlessly.",
            },
            {
              title: "Personalized Profiles",
              description:
                "Create a unique profile to showcase your interests and achievements. Connect with friends, stay updated with your network, and manage your campus activities—all in one place.",
            },
          ].map((feature, index) => (
            <Box key={index}>
              <Typography
                variant="h6"
                sx={{ color: lightBlue, fontWeight: "bold" }}
              >
                {feature.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: theme.palette.text.primary }}
              >
                {feature.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
