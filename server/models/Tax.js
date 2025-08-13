import mongoose from "mongoose";

const taxSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    taxType: { type: String, required: true },
    amount: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Tax", taxSchema);
