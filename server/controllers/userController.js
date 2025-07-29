// controllers/userController.js

// דוגמה לפונקציה שמחזירה פרופיל משתמש (ניתן להרחיב)
const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    // req.user.id מגיע מה־authMiddleware (JWT מפענח את הטוקן)
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
