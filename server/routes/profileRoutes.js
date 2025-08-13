import express from "express";
import { getProfile, createProfile, updateProfile } from "../controllers/profileController.js";
import Profile from "../models/Profile.js";

const router = express.Router();

router.get("/:userId", getProfile);
router.post("/", createProfile);
router.put("/:userId", updateProfile);
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
