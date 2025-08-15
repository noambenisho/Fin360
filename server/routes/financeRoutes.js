// server/routes/financeRoutes.js
import express from "express";
import Profile from "../models/Profile.js";
// If you later add real data sources, you can import more models:
// import Investment from "../models/Investment.js";
// import Tax from "../models/Tax.js";
// import Mortgage from "../models/Mortgage.js";

const router = express.Router();

/**
 * GET /api/finance/summary
 * Returns a minimal summary based on the most recent Profile document.
 * Later you can switch this to use req.user.id to be per-user.
 */
router.get("/summary", async (req, res) => {
  try {
    const profile = await Profile.findOne().sort({ createdAt: -1 });

    const income = profile?.monthlyIncome ?? 0;
    const expenses = profile?.monthlyExpenses ?? 0;
    const netBalance = income - expenses;

    // Simple mock categories & chart data so your dashboard renders:
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
      "Track your expenses weekly to avoid end‑of‑month surprises.",
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
});

/** Optional placeholders to avoid 404s for other endpoints you call from the client */
router.post("/transactions", (req, res) => res.status(501).json({ msg: "Not implemented yet" }));
router.get("/transactions", (req, res) => res.status(501).json({ msg: "Not implemented yet" }));
router.delete("/transactions/:id", (req, res) => res.status(501).json({ msg: "Not implemented yet" }));
router.post("/tax", (req, res) => res.status(501).json({ msg: "Not implemented yet" }));
router.post("/mortgage-investment", (req, res) => res.status(501).json({ msg: "Not implemented yet" }));

export default router;
