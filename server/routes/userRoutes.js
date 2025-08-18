import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"; 
import UserController from "../controllers/userController.js"; 

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, UserController.getProfile);

// Change password
router.put('/password', authMiddleware, UserController.changePassword);

export default router;
