import axios from "axios";
import { getAuthToken, clearAuth } from "../utils/auth";

// 1. Create axios instance
const axiosInstance = axios.create({
  // ✅ FIX: Updated fallback to Port 5001 as requested
  // It tries to read from .env first; if missing, it uses localhost:5001
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Request interceptor - add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Remove Content-Type header for FormData (browser will automatically set it)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response interceptor - handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth and redirect
      clearAuth();
      
      // ✅ FIX: Changed to relative path "/signin"
      // This ensures Mentors stay on port 5175 and Admins stay on port 5173
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;