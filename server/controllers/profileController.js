import Profile from "../models/Profile.js";

// GET /api/profile/:userId
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/profile/
export const createProfile = async (req, res) => {
  const { userId, monthlyIncome, monthlyExpenses, savings, monthlyInvestment, otherAssets, liabilities } = req.body;

  try {
    const profile = new Profile({
      userId,
      monthlyIncome,
      monthlyExpenses,
      savings,
      monthlyInvestment,
      otherAssets,
      liabilities,
    });
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/profile/:userId
export const updateProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true }
    );
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};