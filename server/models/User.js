// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },   // <-- was passwordHash
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

export default mongoose.model("User", userSchema);
