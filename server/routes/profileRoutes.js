import express from "express";
import Profile from "../models/Profile.js";
import profileController from "../controllers/profileController.js";

const router = express.Router();

router.get("/:userId", profileController.getProfile);
router.post("/", profileController.createProfile);
router.put("/:userId", profileController.updateProfile);
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;