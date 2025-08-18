// client/src/services/userService.jsx
import axios from "axios";

const API_USER = "http://localhost:5000/api/user";

export const getUser = async () => {
  const { data } = await axios.get(`${API_USER}/profile`);
  return data;
};

// updateUser: שולח שדות firstName, lastName, email
export const updateUser = async (payload) => {
  const { data } = await axios.put(`${API_USER}/profile`, payload);
  return data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const { data } = await axios.put(`${API_USER}/password`, { currentPassword, newPassword });
  return data;
};

export const getFinancialNews = async () => {
  const { data } = await axios.get(`${API_USER}/news`);
  return data;
};
