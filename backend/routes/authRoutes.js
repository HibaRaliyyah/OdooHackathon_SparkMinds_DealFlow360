const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public Auth Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected Auth Route
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
