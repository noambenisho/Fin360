// services/testCrudService.jsx
import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:5000/api/_test" });

export const seedAll = () => api.post(`/smoketest`).then(r => r.data);
export const wipeAll = () => api.delete(`/wipe`).then(r => r.data);
export const getCounts = () => api.get(`/counts`).then(r => r.data);


// USERS
export const listUsers = () => api.get("/users").then(r => r.data);
export const createUser = (payload) => api.post("/users", payload).then(r => r.data);
export const updateUser = (id, payload) => api.put(`/users/${id}`, payload).then(r => r.data);
export const deleteUser = (id) => api.delete(`/users/${id}`).then(r => r.data);

// PROFILES
export const listProfiles = (userId) => api.get(`/profiles`, { params: { userId } }).then(r => r.data);
export const createProfile = (payload) => api.post(`/profiles`, payload).then(r => r.data);
export const updateProfile = (id, payload) => api.put(`/profiles/${id}`, payload).then(r => r.data);
export const deleteProfile = (id) => api.delete(`/profiles/${id}`).then(r => r.data);

// INVESTMENTS
export const listInvestments = (userId) => api.get(`/investments`, { params: { userId } }).then(r => r.data);
export const createInvestment = (payload) => api.post(`/investments`, payload).then(r => r.data);
export const updateInvestment = (id, payload) => api.put(`/investments/${id}`, payload).then(r => r.data);
export const deleteInvestment = (id) => api.delete(`/investments/${id}`).then(r => r.data);

// TAXES
export const listTaxes = (userId) => api.get(`/taxes`, { params: { userId } }).then(r => r.data);
export const createTax = (payload) => api.post(`/taxes`, payload).then(r => r.data);
export const updateTax = (id, payload) => api.put(`/taxes/${id}`, payload).then(r => r.data);
export const deleteTax = (id) => api.delete(`/taxes/${id}`).then(r => r.data);

// MORTGAGES
export const listMortgages = (userId) => api.get(`/mortgages`, { params: { userId } }).then(r => r.data);
export const createMortgage = (payload) => api.post(`/mortgages`, payload).then(r => r.data);
export const updateMortgage = (id, payload) => api.put(`/mortgages/${id}`, payload).then(r => r.data);
export const deleteMortgage = (id) => api.delete(`/mortgages/${id}`).then(r => r.data);

// SMOKE TEST
export const smokeTest = () => api.post(`/smoketest`).then(r => r.data);
