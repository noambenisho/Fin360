// client/src/services/profileService.jsx
import axios from "axios";
const API = "http://localhost:5000/api/profiles";

export const getProfileByUserId = async (userId) => {
  const { data } = await axios.get(`${API}/${userId}`);
  return data;
};

export const updateProfileByUserId = async (userId, payload) => {
  const { data } = await axios.put(`${API}/${userId}`, payload);
  return data;
};

export const createProfile = async (payload) => {
  const { data } = await axios.post(`${API}`, payload);
  return data;
};
