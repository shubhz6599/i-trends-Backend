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
const { getAllOrders, getAllFeedback, exportOrdersToExcel, updateOrderStatus } = require('../controllers/adminController.js');
const authenticate = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
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


router.get('/orders', authenticate,isAdmin, getAllOrders);
router.get('/feedback', authenticate,isAdmin, getAllFeedback);
router.get('/export', authenticate,isAdmin, exportOrdersToExcel);
// router.put('/order-status/:orderId', updateOrderStatus);
router.put('/order-status/:orderId', authenticate,isAdmin, updateOrderStatus);
module.exports = router;
