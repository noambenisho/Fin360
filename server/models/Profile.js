import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    phone: { type: String },
    yearlySavingsGoal: { type: Number, default: 0 },
    monthlyIncome: { type: Number, default: 0 },
    monthlyExpenses: { type: Number, default: 0 },
    savings: { type: Number, default: 0 }, // חיסכון נוכחי
    monthlyInvestment: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema, "profiles");
