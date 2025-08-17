import express from "express";
import { 
  getSummary,
  createTransaction,
  getTransactions,
  deleteTransaction,
  calculateTax,
  compareMortgageInvestment
} from "../controllers/financeController.js";

const router = express.Router();

router.get("/summary", getSummary);
router.post("/transactions", createTransaction);
router.get("/transactions", getTransactions);
router.delete("/transactions/:id", deleteTransaction);
router.post("/tax", calculateTax);
router.post("/mortgage-investment", compareMortgageInvestment);

export default router;