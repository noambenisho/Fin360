const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    monthlyIncome: { type: Number, default: 0 },
    monthlyExpenses: { type: Number, default: 0 },
    savings: { type: Number, default: 0 },
    monthlyInvestment: { type: Number, default: 0 },
    otherAssets: { type: Number, default: 0 },
    liabilities: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
