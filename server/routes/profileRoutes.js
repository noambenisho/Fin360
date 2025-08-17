import express from "express";
import { getProfile, createProfile, updateProfile, getProfiles } from "../controllers/profileController.js";

const router = express.Router();

router.get("/:userId", getProfile);
router.post("/", createProfile);
router.put("/:userId", updateProfile);
router.get("/", getProfiles);

export default router;
