import express from "express";
import Profile from "../models/Profile.js";

const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");

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

module.exports = router;

