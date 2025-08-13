import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"; 
import UserController from "../controllers/userController.js"; 
console.log(UserController); // לבדוק שהאובייקט אכן קיים


const router = express.Router();

// דוגמה ל-route שמוגן ע"י אימות JWT
router.get('/profile', authMiddleware, UserController.getProfile);

export default router;
