// client/src/services/userService.jsx
import axios from "axios";

const API_USER = "http://localhost:5000/api/user";

// Returns { user, profile }
export const getUser = async () => {
  const { data } = await axios.get(`${API_USER}/profile`);
  return data;
};

// ✅ Update both user + profile in a single call.
// Pass any subset of: firstName, lastName, email, phone,
// yearlySavingsGoal, monthlyIncome, monthlyExpenses, savings, monthlyInvestment
export const updateUser = async (payload) => {
  const { data } = await axios.put(`${API_USER}/profile`, payload);
  return data; // { user, profile }
};

export const changePassword = async (currentPassword, newPassword) => {
  const { data } = await axios.put(`${API_USER}/password`, { currentPassword, newPassword });
  return data;
};

export const getFinancialNews = async () => {
  const { data } = await axios.get(`${API_USER}/news`);
  return data;
};
