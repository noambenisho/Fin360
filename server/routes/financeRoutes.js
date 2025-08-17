import express from "express";
import { 
  getSummary,
  createTransaction,
  getTransactions,
  deleteTransaction,
  addTax,
  addMortgageInvestment
} from "../controllers/financeController.js";

const router = express.Router();

router.get("/summary", getSummary);
router.post("/transactions", createTransaction);
router.get("/transactions", getTransactions);
router.delete("/transactions/:id", deleteTransaction);
router.post("/tax", addTax);
router.post("/mortgage-investment", addMortgageInvestment);

export default router;