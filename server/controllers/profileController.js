const Profile = require("../models/Profile");

// GET /api/profile/:userId
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/profile/
exports.createProfile = async (req, res) => {
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
exports.updateProfile = async (req, res) => {
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
