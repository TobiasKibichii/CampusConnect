import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import HomePage from "scenes/homePage";
import LoginPage from "scenes/loginPage";
import ProfilePage from "scenes/profilePage";
import GroupMessages from "scenes/groupMessages";
import AdminDashboard from "scenes/adminDashboard";
import EditorDashboard from "scenes/editorDashboard";
import SearchResults from "scenes/searchResults";
import SavedPosts from "scenes/savedPosts";
import Notifications from "scenes/notifications";
import ChatSection from "scenes/chat";

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
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/home"
              element={isAuth ? <HomePage /> : <Navigate to="/" />}
            />
            <Route
              path="/profile/:userId"
              element={isAuth ? <ProfilePage /> : <Navigate to="/" />}
            />
             <Route path="/groupMessages/:groupId/messages" element={<GroupMessages />} />
             <Route path="/admin" element={<AdminDashboard />} />
             <Route path="/editor" element={<EditorDashboard />} />
             <Route path="/search" element={<SearchResults />} />
             <Route path="/saved" element={<SavedPosts />} />
             <Route path="/notifications" element={<Notifications />} />
              <Route path="/chat/:userId" element={<ChatSection />} />

          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
