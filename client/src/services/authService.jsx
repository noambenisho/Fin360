import axios from 'axios';
import bcrypt from 'bcryptjs';
import { jwtDecode } from 'jwt-decode'; // Updated import

const API_URL = 'http://localhost:5000/api/auth'; // Replace with your backend URL

export const registerUser = async (userData) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  
  const response = await axios.post(`${API_URL}/register`, {
    ...userData,
    password: hashedPassword
  });
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  const decoded = jwtDecode(response.data.token);
  
  return {
    ...response.data,
    user: decoded?.user
  };
};

export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  
  const response = await axios.post(`${API_URL}/reset-password`, {
    token,
    newPassword: hashedPassword
  });
  return response.data;
};