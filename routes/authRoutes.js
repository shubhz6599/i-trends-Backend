const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  verifyOtp,
  resendOtp,
  getUserDetails,
  updateUserDetails,
  createOrder,
  verifyPayment
} = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verifyOtp", verifyOtp);
router.post("/resendOtp", resendOtp); // Resend OTP API
router.get("/user", authenticate, getUserDetails); // Get user details
router.put("/user", authenticate, updateUserDetails); // Update user details
router.post("/create-order", authenticate, createOrder); // Update user details
router.post("/verify-payment",authenticate, verifyPayment); // Update user details

module.exports = router;
