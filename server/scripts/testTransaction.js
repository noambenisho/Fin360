import mongoose from "mongoose";
import dotenv from "dotenv";
import Transaction from "../models/Transaction.js";

dotenv.config();

const testTransaction = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const transaction = new Transaction({
      userId: new mongoose.Types.ObjectId(), // זה ייצור ID זמני למטרות בדיקה
      amount: 100,
      type: "income",
      category: "Salary",
      description: "Test transaction",
    });

    await transaction.save();
    console.log("Test transaction saved successfully");
    console.log("Transaction details:", transaction);

    const allTransactions = await Transaction.find();
    console.log("All transactions:", allTransactions);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

testTransaction();
