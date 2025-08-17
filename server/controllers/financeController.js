import Profile from "../models/Profile.js";

export const getSummary = async (req, res) => {
  try {
    const profile = await Profile.findOne().sort({ createdAt: -1 });

    const income = profile?.monthlyIncome ?? 0;
    const expenses = profile?.monthlyExpenses ?? 0;
    const netBalance = income - expenses;

    const expenseCategories = [
      { id: 0, value: Math.max(1, Math.round(expenses * 0.4)), label: "Housing" },
      { id: 1, value: Math.max(1, Math.round(expenses * 0.25)), label: "Food" },
      { id: 2, value: Math.max(1, Math.round(expenses * 0.15)), label: "Transport" },
      { id: 3, value: Math.max(1, Math.round(expenses * 0.2)), label: "Other" },
    ];

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const monthlyIncome = months.map(() => income);
    const monthlyExpenses = months.map(() => expenses);

    const alerts = [];
    if (income === 0) alerts.push({ severity: "warning", message: "No income recorded in your profile yet." });
    if (expenses > income && income > 0) alerts.push({ severity: "error", message: "Your monthly expenses exceed your income." });

    const tips = [
      "Track your expenses weekly to avoid end-of-month surprises.",
      "Pay yourself first: automate a monthly transfer to savings.",
      "Review recurring subscriptions every quarter.",
    ];

    res.json({
      income,
      expenses,
      netBalance,
      expenseCategories,
      months,
      monthlyIncome,
      monthlyExpenses,
      alerts,
      tips,
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to build financial summary", detail: err.message });
  }
};

// placeholders
export const createTransaction = (req, res) => res.status(501).json({ msg: "Not implemented yet" });
export const getTransactions = (req, res) => res.status(501).json({ msg: "Not implemented yet" });
export const deleteTransaction = (req, res) => res.status(501).json({ msg: "Not implemented yet" });
export const addTax = (req, res) => res.status(501).json({ msg: "Not implemented yet" });
export const addMortgageInvestment = (req, res) => res.status(501).json({ msg: "Not implemented yet" });