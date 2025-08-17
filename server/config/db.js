import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: host=${conn.connection.host} db=${conn.connection.name}`);
  } catch (err) {
    console.error("Mongo connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
