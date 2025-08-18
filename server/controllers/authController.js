import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { email, password, firstName, lastName, name, role } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "User already exists" });

    const profileName =
      name ?? [firstName, lastName].filter(Boolean).join(" ").trim();

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      firstName,
      lastName,
      role: role || "user", 
      password: hashed,
      name: profileName || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    });
    console.log("New user created:", newUser);

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({
      msg: "Server error",
      detail: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
