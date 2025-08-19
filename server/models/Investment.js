import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Investment", investmentSchema);
