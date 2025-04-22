import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import LandingPage from "scenes/LandingPage";
import LoginPage from "scenes/loginPage";
import HomePage from "scenes/homePage";
import ProfilePage from "scenes/profilePage";
import GroupMessages from "scenes/groupMessages";
import AdminDashboard from "scenes/adminDashboard";
import EditorDashboard from "scenes/editorDashboard";
import SearchResults from "scenes/searchResults";
import SavedPosts from "scenes/savedPosts";
import Notifications from "scenes/notifications";
import ChatSection from "scenes/chat";
import FollowEditorsPage from "scenes/loginPage/followEditors";
import MessageNotifications from "scenes/MessageNotifications";
import DisplayPosts from "scenes/displayPage";
import RegisteredEvents from "scenes/registeredEvents";
import Layout from "scenes/Layout"; // adjust path accordingly

import { useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";
import { toast, ToastContainer } from "react-toastify";  
import "react-toastify/dist/ReactToastify.css";
import socket from "./socket.js";  // Ensure your socket instance is properly configured

function App() {
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const isAuth = Boolean(useSelector((state) => state.token));

  useEffect(() => {
    // Listen for the socket event to show notifications
    socket.on("groupJoinApproved", (notification) => {
      console.log("📨 Received notification:", notification);
      toast.success(
        `Your request to join ${notification.groupName} has been approved!`
      );
    });

    // Clean up the socket listener when the component is unmounted
    return () => {
      socket.off("groupJoinApproved");
    };
  }, []);

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {/* Global ToastContainer */}
          <ToastContainer position="top-right" autoClose={5000} />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/follow-editors" element={<FollowEditorsPage />} />

            {/* Protected Routes Wrapped in Layout */}
            <Route
              element={isAuth ? <Layout /> : <Navigate to="/login" />}
            >
              <Route path="/home" element={<HomePage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route
                path="/groupMessages/:groupId/messages"
                element={<GroupMessages />}
              />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/editor" element={<EditorDashboard />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/saved" element={<SavedPosts />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/chat/:userId" element={<ChatSection />} />
              <Route path="/messages" element={<MessageNotifications />} />
              <Route path="/events/:postId" element={<DisplayPosts />} />
              <Route path="/posts/:postId" element={<DisplayPosts />} />
              <Route path="/registeredEvents" element={<RegisteredEvents />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
