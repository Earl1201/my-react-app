import axios from "axios";

// In production (Vercel), VITE_API_URL is set to the Render backend URL.
// In development, the Vite proxy forwards /api → localhost:5000.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT from localStorage to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nh_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server returns 401, clear local storage so the user is logged out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("nh_token");
      localStorage.removeItem("nh_user");
    }
    return Promise.reject(error);
  }
);

export default api;
