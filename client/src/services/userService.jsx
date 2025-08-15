// services/userService.jsx
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/user'; // SINGULAR! matches app.use("/api/user", userRoutes)

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getProfile = async () => {
  const res = await axios.get(`${API_URL}/profile`, { headers: authHeader() });
  return res.data; // returns the User document from the server
};

export const updateProfile = async (profileData) => {
  // You don't actually have a PUT /api/user/profile route in the backend code you sent.
  // If you intended to update "User", you need to add such a route on the server.
  // For now, this will 404 unless you add that route.
  const res = await axios.put(`${API_URL}/profile`, profileData, { headers: authHeader() });
  return res.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  // Same note: no such backend route exists yet in your code.
  const res = await axios.put(`${API_URL}/password`, { currentPassword, newPassword }, { headers: authHeader() });
  return res.data;
};
