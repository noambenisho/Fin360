import express from "express";
import { createComparison, getComparisons } from "../controllers/comparisonController.js";
import authMiddleware from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.post("/", authMiddleware, createComparison); 
router.get("/", authMiddleware, getComparisons);   

export default router;
