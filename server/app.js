// app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Imports
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import testCrudRoutes from "./routes/testCrudRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import financeRoutes from "./routes/financeRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import comparisonRoutes from "./routes/comparisonRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// DB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/_test", testCrudRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/finance", authMiddleware, financeRoutes);
app.use("/api/comparisons", comparisonRoutes);

app.use("/api/_test", testCrudRoutes);

app.get("/", (_req, res) => res.send("Fin360 API running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
