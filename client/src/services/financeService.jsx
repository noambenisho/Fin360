import axios from "axios";

const API_URL = "http://localhost:5000/api/transactions";

// Add interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
);

export const addTransaction = async (transaction) => {
  try {
    const response = await axios.post(API_URL, transaction);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to add transaction"
    );
  }
};

export const getTransactions = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch transactions"
    );
  }
};

export const deleteTransaction = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete transaction"
    );
  }
};

export const updateTransaction = async (id, transaction) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, transaction);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update transaction"
    );
  }
};

export const getFinancialSummary = async () => {
  try {
    const response = await axios.get(`${API_URL}/summary`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch financial summary"
    );
  }
};

export const calculateTax = async (data) => {
  try {
    if (!data.income) {
      throw new Error("Income is required");
    }
    const response = await axios.post(`${API_URL}/tax`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.msg || "Failed to calculate tax");
  }
};

export const compareMortgageInvestment = async (data) => {
  try {
    const required = [
      "mortgageAmount",
      "mortgageRate",
      "mortgageYears",
      "investmentAmount",
      "investmentRate",
    ];
    const missing = required.filter((field) => !data[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }

    const response = await axios.post(`${API_URL}/mortgage-investment`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.msg || "Failed to compare mortgage and investment");
  }
};
