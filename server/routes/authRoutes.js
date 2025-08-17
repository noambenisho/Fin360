// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// const router = express.Router();

// // routes/authRoutes.js
// router.post('/register', async (req, res) => {
//   const { email, password, firstName, lastName, name } = req.body;
//   try {
//     const exists = await User.findOne({ email });
//     if (exists) return res.status(400).json({ msg: 'User already exists' });

//     // choose one of these depending on your schema:
//     const profileName = name ?? [firstName, lastName].filter(Boolean).join(' ').trim();

//     const hashed = await bcrypt.hash(password, 10);
//     const newUser = await User.create({
//       email,
//       password: hashed,
//       // if your schema needs these, include them:
//       name: profileName || undefined,
//       firstName: firstName || undefined,
//       lastName: lastName || undefined,
//     });

//     const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.status(201).json({ token });
//   } catch (err) {
//     // expose validation details in dev so we see why it failed
//     res.status(500).json({
//       msg: 'Server error',
//       detail: process.env.NODE_ENV === 'production' ? undefined : err.message,
//     });
//   }
// });

// // התחברות
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ msg: 'User not found' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.status(200).json({ token });
//   } catch (err) {
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// export default router;

import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

export default router;
