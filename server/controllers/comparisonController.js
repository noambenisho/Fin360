import Comparison from "../models/Comparison.js";

// Save a new comparison
export const createComparison = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { input, results, monthlyBreakdown } = req.body;

    const comparison = new Comparison({
      userId,
      input,
      results,
      monthlyBreakdown,
    });

    const saved = await comparison.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save comparison" });
  }
};

// Get all comparisons for current user
export const getComparisons = async (req, res) => {
  try {
    const userId = req.user.id;
    const comparisons = await Comparison.find({ userId }).sort({
      createdAt: -1,
    });
    res.json(comparisons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch comparisons" });
  }
};
