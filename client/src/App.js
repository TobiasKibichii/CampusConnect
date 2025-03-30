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

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";

function App() {
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const isAuth = Boolean(useSelector((state) => state.token));

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Authentication routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes */}
            <Route
              path="/home"
              element={isAuth ? <HomePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile/:userId"
              element={isAuth ? <ProfilePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/groupMessages/:groupId/messages"
              element={isAuth ? <GroupMessages /> : <Navigate to="/login" />}
            />
            <Route
              path="/admin"
              element={isAuth ? <AdminDashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/editor"
              element={isAuth ? <EditorDashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/search"
              element={isAuth ? <SearchResults /> : <Navigate to="/login" />}
            />
            <Route
              path="/saved"
              element={isAuth ? <SavedPosts /> : <Navigate to="/login" />}
            />
            <Route
              path="/notifications"
              element={isAuth ? <Notifications /> : <Navigate to="/login" />}
            />
            <Route
              path="/chat/:userId"
              element={isAuth ? <ChatSection /> : <Navigate to="/login" />}
    
            />
            <Route path="/follow-editors" element={<FollowEditorsPage />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
