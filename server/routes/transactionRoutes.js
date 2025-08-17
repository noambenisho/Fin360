import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import * as transactionController from "../controllers/transactionController.js";

const router = express.Router();

// כל הראוטים מוגנים - נדרש טוקן תקף
router.use(authMiddleware);

// קבלת כל העסקאות של המשתמש המחובר
router.get("/", transactionController.getTransactions);

// הוספת עסקה חדשה
router.post("/", transactionController.createTransaction);

// עדכון עסקה קיימת
router.put("/:id", transactionController.updateTransaction);

// מחיקת עסקה
router.delete("/:id", transactionController.deleteTransaction);

// קבלת סיכום חודשי
router.get("/summary", transactionController.getMonthlySummary);

export default router;
