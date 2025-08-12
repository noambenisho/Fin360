import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users'; // Replace with your backend URL

export const getProfile = async () => {
  const response = await axios.get(`${API_URL}/profile`);
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await axios.put(`${API_URL}/profile`, profileData);
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await axios.put(`${API_URL}/password`, {
    currentPassword,
    newPassword
  });
  return response.data;
};

export const getFinancialNews = async () => {
  const response = await axios.get(`${API_URL}/news`);
  return response.data;
};