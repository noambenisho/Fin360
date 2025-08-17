// src/services/financeService.jsx
import axios from "axios";

const API_TRANSACTIONS = "http://localhost:5000/api/transactions";
const API_FINANCE = "http://localhost:5000/api/finance";

// Optional: centralize error formatting
const errMsg = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.msg ||
  error?.message ||
  fallback;

// Global response interceptor (kept from your version)
axios.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/* ---------- Transactions CRUD (protected) ---------- */

export const addTransaction = async (transaction) => {
  try {
    const { data } = await axios.post(API_TRANSACTIONS, transaction);
    return data;
  } catch (error) {
    throw new Error(errMsg(error, "Failed to add transaction"));
  }
};

export const getTransactions = async () => {
  try {
    const { data } = await axios.get(API_TRANSACTIONS);
    return data;
  } catch (error) {
    throw new Error(errMsg(error, "Failed to fetch transactions"));
  }
};

export const deleteTransaction = async (id) => {
  try {
    const { data } = await axios.delete(`${API_TRANSACTIONS}/${id}`);
    return data;
  } catch (error) {
    throw new Error(errMsg(error, "Failed to delete transaction"));
  }
};

export const getFinancialSummary = async () => {
  try {
    const { data } = await axios.get(`${API_TRANSACTIONS}/summary`);
    return data;
  } catch (error) {
    throw new Error(errMsg(error, "Failed to fetch financial summary"));
  }
};

export const updateTransaction = async (id, transaction) => {
  try {
    const { data } = await axios.put(`${API_TRANSACTIONS}/${id}`, transaction);
    return data;
  } catch (error) {
    throw new Error(errMsg(error, "Failed to update transaction"));
  }
};

/* ---------- Extra endpoints (if/when used) ---------- */

export const calculateTax = async (data) => {
  try {
    const { data: res } = await axios.post(`${API_TRANSACTIONS}/tax`, data);
    return res;
  } catch (error) {
    throw new Error(errMsg(error, "Failed to calculate tax"));
  }
};

export const compareMortgageInvestment = async (data) => {
  try {
    const { data: res } = await axios.post(
      `${API_TRANSACTIONS}/mortgage-investment`,
      data
    );
    return res;
  } catch (error) {
    throw new Error(errMsg(error, "Failed to compare mortgage and investment"));
  }
};
