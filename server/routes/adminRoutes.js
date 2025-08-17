// routes/adminRoutes.js
import express from "express";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// User management
router.get("/users", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

router.delete("/users/:id", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ msg: "User deleted" });
});

router.patch("/users/:id/role", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ msg: "Invalid role" });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
  res.json(user);
});

// Profile management
router.get("/profiles", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  const profiles = await Profile.find().populate("userId", "email role");
  res.json(profiles);
});

router.delete("/profiles/:id", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  await Profile.findByIdAndDelete(req.params.id);
  res.json({ msg: "Profile deleted" });
});

export default router;
