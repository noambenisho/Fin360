// app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// put ALL imports together:
import connectDB from "./config/db.js";      // or "./db.js" if that's your actual path
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import financeRoutes from "./routes/financeRoutes.js";
// import debugRoutes from "./routes/debugRoutes.js";   // <— keep just this ONE import

import testCrudRoutes from "./routes/testCrudRoutes.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// DB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
// app.use("/api/profile", profileRoutes);
app.use("/api/profiles", profileRoutes); 
app.use("/api/finance", financeRoutes);
// app.use("/api/_debug", debugRoutes);     // <— mounted once
app.use("/api/_test", testCrudRoutes);

app.get("/", (_req, res) => res.send("Fin360 API running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
