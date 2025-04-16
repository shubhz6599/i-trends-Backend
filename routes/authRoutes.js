const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  verifyOtp
} = require('../controllers/authController');

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verifyOtp", verifyOtp);

module.exports = router;
