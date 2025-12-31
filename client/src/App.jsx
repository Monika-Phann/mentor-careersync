import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import AppRoutes from "./routes/AppRoutes";
import {
  getAuthToken,
  getUserData,
  setUserData,
  clearAuth,
} from "./utils/auth";
import { getMyMentorProfile } from "./api/mentorApi";
import axiosInstance from "./api/axiosInstance";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAuthToken();
      
      // ✅ FIX 1: Check specifically for the login page to avoid infinite redirect loops
      const isLoginPage = window.location.pathname === "/login";

      if (!token) {
        // If we are already on the login page, stop loading and let the router handle it
        if (isLoginPage) {
          setIsLoading(false);
          return;
        }

        // ✅ FIX 2: Redirect to relative path "/login" (Stays on Port 5175)
        // Do NOT use http://localhost:5173/signin
        window.location.href = "/login";
        return;
      }

      // Set loading to false immediately to render the app
      setIsLoading(false);

      // Fetch user data in the background (non-blocking)
      try {
        let userData = getUserData();

        if (!userData || !userData.Mentor) {
          try {
            const userResponse = await axiosInstance.get("/auth/me");
            if (userResponse.data) {
              setUserData(userResponse.data);
              userData = userResponse.data;
            }
          } catch (userError) {
            // Silently handle error
          }

          if (!userData?.Mentor) {
            const profileResponse = await getMyMentorProfile();
            if (profileResponse?.mentor) {
              const updatedUserData = {
                ...userData,
                Mentor: profileResponse.mentor,
              };
              setUserData(updatedUserData);
            }
          }
        }
      } catch (error) {
        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          clearAuth();
          // ✅ FIX 3: Redirect to relative path "/login" on error too
          window.location.href = "/login";
          return;
        }
      }
    };

    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <CircularProgress />
        <Typography>Loading mentor platform...</Typography>
      </Box>
    );
  }

  return <AppRoutes />;
}

export default App;