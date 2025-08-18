// server/controllers/userController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Profile from "../models/Profile.js";

const toNumOrUndefined = (v) =>
  v === undefined || v === null || v === "" ? undefined : Number(v);

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    let profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = new Profile({ userId: req.user.id });
      await profile.save();
    }

    res.json({ user, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName, lastName, email, phone,
      yearlySavingsGoal, monthlyIncome, monthlyExpenses, savings, monthlyInvestment
    } = req.body;

    // Update user (safe: only defined values)
    const userUpdates = {};
    if (firstName !== undefined) userUpdates.firstName = firstName;
    if (lastName !== undefined) userUpdates.lastName = lastName;
    if (email !== undefined) userUpdates.email = email;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      userUpdates,
      { new: true }
    ).select("-password");

    // Upsert profile (preserve when fields omitted)
    let profile = await Profile.findOne({ userId });
    if (!profile) {
      profile = new Profile({
        userId,
        phone: phone ?? "",
        yearlySavingsGoal: toNumOrUndefined(yearlySavingsGoal) ?? 0,
        monthlyIncome: toNumOrUndefined(monthlyIncome) ?? 0,
        monthlyExpenses: toNumOrUndefined(monthlyExpenses) ?? 0,
        savings: toNumOrUndefined(savings) ?? 0,
        monthlyInvestment: toNumOrUndefined(monthlyInvestment) ?? 0
      });
    } else {
      if (phone !== undefined) profile.phone = phone;
      if (yearlySavingsGoal !== undefined) profile.yearlySavingsGoal = toNumOrUndefined(yearlySavingsGoal);
      if (monthlyIncome !== undefined) profile.monthlyIncome = toNumOrUndefined(monthlyIncome);
      if (monthlyExpenses !== undefined) profile.monthlyExpenses = toNumOrUndefined(monthlyExpenses);
      if (savings !== undefined) profile.savings = toNumOrUndefined(savings);
      if (monthlyInvestment !== undefined) profile.monthlyInvestment = toNumOrUndefined(monthlyInvestment);
    }

    await profile.save();
    res.json({ user: updatedUser, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to update profile", error: err.message });
  }
};

const UserController = {
  getProfile,
  changePassword,
  updateProfile,
};

export default UserController;
