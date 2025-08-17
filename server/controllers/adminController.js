import User from "../models/User.js";
import Profile from "../models/Profile.js";

// User management
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch users", error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete user", error: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Failed to update role", error: err.message });
  }
};

// Profile management
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate("userId", "email role");
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch profiles", error: err.message });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    await Profile.findByIdAndDelete(req.params.id);
    res.json({ msg: "Profile deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete profile", error: err.message });
  }
};
