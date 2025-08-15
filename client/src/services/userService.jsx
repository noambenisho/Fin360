// /src/services/userService.jsx
import axios from 'axios';

// FIX: singular path
const API_URL = 'http://localhost:5000/api/user';

// make sure these are exported in this file:
export const getProfile = async () => (await axios.get(`${API_URL}/profile`)).data;
export const updateProfile = async (profileData) => (await axios.put(`${API_URL}/profile`, profileData)).data;
export const changePassword = async (currentPassword, newPassword) =>
  (await axios.put(`${API_URL}/password`, { currentPassword, newPassword })).data;

// NEW or ensure it exists:
export const getFinancialNews = async () => (await axios.get(`${API_URL}/news`)).data;
