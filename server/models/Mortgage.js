import mongoose from "mongoose";

const mortgageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    totalAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    termYears: { type: Number, required: true },
    monthlyPayment: { type: Number },
    startDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Mortgage", mortgageSchema);
