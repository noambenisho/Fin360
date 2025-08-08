const mongoose = require("mongoose");

const taxSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    taxType: { type: String, required: true },
    amount: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tax", taxSchema);
