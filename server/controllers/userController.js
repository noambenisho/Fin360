import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Profile from "../models/Profile.js";

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    let profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      // אם עוד לא נוצר פרופיל – ניצור אחד חדש עם ערכי ברירת מחדל
      profile = new Profile({ userId: req.user.id });
      await profile.save();
    }

    res.json({ user, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, phone, yearlySavingsGoal, monthlyIncome, monthlyExpenses, savings, monthlyInvestment } = req.body;

    // עדכון User (שם/אימייל)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, email },
      { new: true }
    ).select("-password");

    // עדכון או יצירת פרופיל פיננסי מלא
    let profile = await Profile.findOne({ userId });
    if (!profile) {
      profile = new Profile({
        userId,
        phone: phone || "",
        yearlySavingsGoal: yearlySavingsGoal ?? 0,
        monthlyIncome: monthlyIncome ?? 0,
        monthlyExpenses: monthlyExpenses ?? 0,
        savings: savings ?? 0,
        monthlyInvestment: monthlyInvestment ?? 0
      });
    } else {
      profile.phone = phone ?? profile.phone;
      profile.yearlySavingsGoal = yearlySavingsGoal ?? profile.yearlySavingsGoal;
      profile.monthlyIncome = monthlyIncome ?? profile.monthlyIncome;
      profile.monthlyExpenses = monthlyExpenses ?? profile.monthlyExpenses;
      profile.savings = savings ?? profile.savings;
      profile.monthlyInvestment = monthlyInvestment ?? profile.monthlyInvestment;
    }
    await profile.save();

    // החזר שני הסמכים כדי שהלקוח יעדכן את ה-state בקלות
    res.json({ user: updatedUser, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to update profile", error: err.message });
  }
};

const UserController = {
  getProfile,
  changePassword,
  updateProfile,
};

export default UserController;
