import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Profile from "../models/Profile.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || "development",
    db: {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState, // 1 = connected
    },
    models: Object.keys(mongoose.models),
  });
});

router.get("/counts", async (req, res) => {
  const [users, profiles] = await Promise.all([
    User.countDocuments(),
    Profile.countDocuments(),
  ]);
  res.json({ users, profiles });
});

router.post("/seed", async (req, res) => {
  const user = await User.create({
    name: "Demo User",
    email: `demo${Date.now()}@example.com`,
    password: "hashed-password-here",
  });
  const profile = await Profile.create({
    userId: user._id,
    monthlyIncome: 10000,
    monthlyExpenses: 5000,
  });
  res.status(201).json({ user, profile });
});

export default router;
