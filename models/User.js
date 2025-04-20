const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  dob: {
    type: Date, // Date of Birth
    required: true
  },
  mobile: {
    type: String, // Mobile Number
    required: true
  },
  otp: String, // OTP for email verification
  otpExpiry: Date,
   resendOtpCount: {
    type: Number,
    default: 0 // Tracks how many times the user has requested OTP
  },
  lastResendTimestamp: {
    type: Date, // Tracks the last time OTP was resent
  },
  isOtpVerified: {
    type: Boolean,
    default: false // Default to false until verified
  },
  isAdmin: { type: Boolean, default: false },
  resetToken: String,
  resetTokenExpiry: Date
});

module.exports = mongoose.model("User", userSchema);
