import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// התחברות למונגו
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

// הגדרת סכמה לעסקאות
const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

// יצירת עסקה ראשונה
const createFirstTransaction = async () => {
  const transaction = new Transaction({
    userId: new mongoose.Types.ObjectId(), // נשתמש ב-ID זמני
    amount: 1000,
    type: "income",
    category: "Salary",
    description: "First salary",
  });

  try {
    const savedTransaction = await transaction.save();
    console.log("Transaction created successfully:", savedTransaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
  } finally {
    await mongoose.disconnect();
  }
};

createFirstTransaction();
