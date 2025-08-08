const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // ניצור בהמשך
const UserController = require('../controllers/userController'); // ניצור אותו בעתיד

// דוגמה ל-route שמוגן ע"י אימות JWT
router.get('/profile', authMiddleware, UserController.getProfile);

module.exports = router;
