import axios from 'axios';

const API_URL = 'http://localhost:5000/api/finance'; // Replace with your backend URL

export const getFinancialSummary = async () => {
  const response = await axios.get(`${API_URL}/summary`);
  return response.data;
};

export const addTransaction = async (transaction) => {
  const response = await axios.post(`${API_URL}/transactions`, transaction);
  return response.data;
};

export const getTransactions = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/transactions`, { params: filters });
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await axios.delete(`${API_URL}/transactions/${id}`);
  return response.data;
};

export const calculateTax = async (data) => {
  const response = await axios.post(`${API_URL}/tax`, data);
  return response.data;
};

export const compareMortgageInvestment = async (data) => {
  const response = await axios.post(`${API_URL}/mortgage-investment`, data);
  return response.data;
};