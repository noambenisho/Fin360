// server/controllers/profileController.js
import Profile from "../models/Profile.js";

// GET /api/profiles/:userId
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/profiles/
export const createProfile = async (req, res) => {
  const { userId, monthlyIncome, monthlyExpenses, savings, monthlyInvestment, phone, yearlySavingsGoal } = req.body;

  try {
    const profile = new Profile({
      userId,
      phone,
      yearlySavingsGoal,
      monthlyIncome,
      monthlyExpenses,
      savings,
      monthlyInvestment,
    });
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/profiles/:userId
export const updateProfile = async (req, res) => {
  try {
    const updates = {};

    // קבל רק השדות שאנחנו מאפשרים לעדכן
    const allowed = ["phone", "yearlySavingsGoal", "monthlyIncome", "monthlyExpenses", "savings", "monthlyInvestment"];
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] = req.body[key];
      }
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: updates },
      { new: true, upsert: true } // upsert: אם לא קיים, צור חדש
    );

    res.json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/profiles (admin)
export const getProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate("userId", "email firstName lastName");
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
