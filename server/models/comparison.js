import mongoose from "mongoose";

const comparisonSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  input: {
    initialHousePrice: Number,
    downPayment: Number,
    mortgageRate: Number,
    monthlyRent: Number,
    houseAppreciationRate: Number,
    initialInvestment: Number,
    investmentRate: Number,
    years: Number,
  },
  results: {
    mortgage: {
      totalPaid: Number,
      totalInterest: Number,
      balance: Number,
      houseValue: Number,
      finalEquity: Number,
      totalRentalIncome: Number,
    },
    investment: {
      finalValue: Number,
      totalContribution: Number,
      totalGrowth: Number,
    },
    comparison: Number, // >0 = investment advantage
  },
  monthlyBreakdown: {
    buyNetWorth: [Number],
    investNetWorth: [Number],
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Comparison", comparisonSchema);
