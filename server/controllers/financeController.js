import Profile from "../models/Profile.js";
import Investment from "../models/Investment.js";
import Mortgage from "../models/Mortgage.js";
import mongoose from "mongoose";

export const getSummary = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    const income = profile?.monthlyIncome ?? 0;
    const expenses = profile?.monthlyExpenses ?? 0;
    const netBalance = income - expenses;

    const expenseCategories = [
      {
        id: 0,
        value: Math.max(1, Math.round(expenses * 0.4)),
        label: "Housing",
      },
      { id: 1, value: Math.max(1, Math.round(expenses * 0.25)), label: "Food" },
      {
        id: 2,
        value: Math.max(1, Math.round(expenses * 0.15)),
        label: "Transport",
      },
      { id: 3, value: Math.max(1, Math.round(expenses * 0.2)), label: "Other" },
    ];

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const monthlyIncome = months.map(() => income);
    const monthlyExpenses = months.map(() => expenses);

    const alerts = [];
    if (income === 0)
      alerts.push({
        severity: "warning",
        message: "No income recorded in your profile yet.",
      });
    if (expenses > income && income > 0)
      alerts.push({
        severity: "error",
        message: "Your monthly expenses exceed your income.",
      });

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
    res
      .status(500)
      .json({ msg: "Failed to build financial summary", detail: err.message });
  }
};

// Investment operations
export const createTransaction = async (req, res) => {
  try {
    const { title, amount, category } = req.body;
    if (!req.user?.id) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    const investment = new Investment({
      userId: req.user.id,
      title,
      amount,
      category,
      date: new Date(),
    });

    await investment.save();
    res.status(201).json(investment);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Failed to create transaction", detail: err.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    const investments = await Investment.find({ userId: req.user.id });
    res.json(investments);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Failed to fetch transactions", detail: err.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user?.id) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid transaction ID" });
    }

    const result = await Investment.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!result) {
      return res.status(404).json({ msg: "Transaction not found" });
    }

    res.json({ msg: "Transaction deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Failed to delete transaction", detail: err.message });
  }
};

export const calculateTax = async (req, res) => {
  try {
    const { income, deductions = 0, credits = 0 } = req.body;

    if (!income || income < 0) {
      return res.status(400).json({ msg: "Invalid income amount" });
    }

    const taxableIncome = income - deductions;
    let taxAmount = 0;

    // Progressive tax rates (example)
    if (taxableIncome <= 50000) {
      taxAmount = taxableIncome * 0.1;
    } else if (taxableIncome <= 100000) {
      taxAmount = 5000 + (taxableIncome - 50000) * 0.2;
    } else {
      taxAmount = 15000 + (taxableIncome - 100000) * 0.3;
    }

    taxAmount = Math.max(0, taxAmount - credits);

    res.json({
      taxableIncome,
      taxAmount,
      effectiveRate: ((taxAmount / income) * 100).toFixed(2),
    });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Failed to calculate tax", detail: err.message });
  }
};

export const compareMortgageInvestment = async (req, res) => {
  try {
    const {
      mortgageAmount,
      mortgageRate,
      mortgageYears,
      investmentAmount,
      investmentRate,
    } = req.body;

    if (
      !mortgageAmount ||
      !mortgageRate ||
      !mortgageYears ||
      !investmentAmount ||
      !investmentRate
    ) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // Calculate mortgage costs
    const monthlyRate = mortgageRate / 100 / 12;
    const totalPayments = mortgageYears * 12;
    const monthlyPayment =
      (mortgageAmount *
        monthlyRate *
        Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    const totalMortgageCost = monthlyPayment * totalPayments;

    // Calculate investment returns
    const yearlyInvestmentReturn =
      investmentAmount * Math.pow(1 + investmentRate / 100, mortgageYears);

    res.json({
      mortgageDetails: {
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalCost: Math.round(totalMortgageCost * 100) / 100,
        totalInterest:
          Math.round((totalMortgageCost - mortgageAmount) * 100) / 100,
      },
      investmentDetails: {
        initialAmount: investmentAmount,
        finalAmount: Math.round(yearlyInvestmentReturn * 100) / 100,
        totalReturn:
          Math.round((yearlyInvestmentReturn - investmentAmount) * 100) / 100,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({
        msg: "Failed to compare mortgage and investment",
        detail: err.message,
      });
  }
};
