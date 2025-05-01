import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import FlexBetween from "components/FlexBetween";
import AboutSection from "./About";
import FeaturesSection from "./Features";

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const lightBlue = "#66ccff"; // Light blue for text and buttons
  const darkHeader = "#333333"; // Dark grey for header and footer

  // State for internal sections: "welcome", "about", or "features"
  const [activeSection, setActiveSection] = useState("welcome");

  // Function to render the main content based on internal state.
  const renderMainContent = () => {
    if (activeSection === "about") {
      return <AboutSection />;
    }
    if (activeSection === "features") {
      return <FeaturesSection />;
    }
    // Default: Welcome / Hero Section
    return (
      <Box
        sx={{
          position: "relative",
          height: "80vh",
          backgroundImage: "url(/assets/landing-image.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "grey.300", // fallback if image is missing
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Dark overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
        />
        <Container
          sx={{
            position: "relative",
            textAlign: "center",
            px: 2,
            color: "#fff",
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Welcome to Campus Connect
          </Typography>
          <Typography variant="h6" component="p" gutterBottom>
            Your gateway to campus events, collaboration, and community.
          </Typography>
          <Typography
            variant="body1"
            sx={{ maxWidth: "600px", mx: "auto", mb: 3 }}
          >
            We empower campus communities by uniting students, faculty, and
            administrators under one digital roof. Experience seamless event
            management, real-time notifications, collaborative communication,
            and personalized profiles—all designed to enrich your campus life.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 3, px: 4, py: 1.5, backgroundColor: lightBlue }}
            onClick={() => navigate("/login")}
          >
            Join Us Today
          </Button>
        </Container>
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Navbar */}
      <AppBar
        position="static"
        sx={{ backgroundColor: darkHeader, boxShadow: "none" }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography
            variant="h4"
            component="div"
            sx={{ cursor: "pointer", fontWeight: "bold", color: lightBlue }}
            onClick={() => {
              setActiveSection("welcome");
              navigate("/"); // Also ensure URL reflects the landing page root.
            }}
          >
            Campus Connect
          </Typography>
          <FlexBetween gap="1rem">
            <Button color="inherit" onClick={() => setActiveSection("about")}>
              <Typography
                sx={{ cursor: "pointer", fontWeight: "bold", color: lightBlue }}
              >
                About
              </Typography>
            </Button>
            <Button
              color="inherit"
              onClick={() => setActiveSection("features")}
            >
              <Typography
                sx={{ cursor: "pointer", fontWeight: "bold", color: lightBlue }}
              >
                Features
              </Typography>
            </Button>

            <Button color="inherit" onClick={() => navigate("/login")}>
              <Typography
                sx={{ cursor: "pointer", fontWeight: "bold", color: lightBlue }}
              >
                Login
              </Typography>
            </Button>
          </FlexBetween>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1 }}>{renderMainContent()}</Box>

      {/* Footer */}
      <Box sx={{ mt: "auto", backgroundColor: darkHeader, py: 2 }}>
        <Container maxWidth="md">
          <Typography variant="body2" align="center" sx={{ color: "#fff" }}>
            &copy; {new Date().getFullYear()} Campus Connect. All rights
            reserved.
          </Typography>
          <Typography
            variant="caption"
            align="center"
            sx={{ color: "#fff", display: "block", mt: 1 }}
          >
            Love you, boo!
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
