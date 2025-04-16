const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const signup = async (req, res) => {
  const { name, email, password, dob, mobile } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const otpExpiry = Date.now() + 300000; // OTP valid for 5 minutes

    
    const user = await User.create({ name, email, password: hashed, dob, mobile, otp, otpExpiry });

    await sendEmail(
    user.email,
    "Verify Your Email",
    `<p>Your OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`
    );
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if OTP matches and is not expired
    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP fields after successful verification
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.isOtpVerified = true;
    await user.save();
      await sendEmail(
      user.email,
      "OTP Verified Successfully",
      `<p>Thank you for verifying your email. Your account is now active.</p>`
    );

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a new OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    user.otp = otp;
    user.otpExpiry = Date.now() + 300000; // OTP valid for 5 minutes
    await user.save();

    // Send OTP via email
    await sendEmail(
      user.email,
      "Resend OTP",
      `<p>Your new OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`
    );

    res.json({ message: "OTP resent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(20).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `http://localhost:4200/reset-password/${token}`;
    await sendEmail(user.email, "Reset Password", `<p>Reset your password <a href="${resetLink}">here</a></p>`);

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password cannot be the same as the current password"
      });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      user,
      isOtpVerified: user.isOtpVerified // Include OTP verification status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUserDetails = async (req, res) => {
  const { name, dob, mobile } = req.body;
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Update user details
    if (name) user.name = name;
    if (dob) user.dob = dob;
    if (mobile) user.mobile = mobile;

    await user.save();

    res.json({ message: "User details updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  verifyOtp,
  getUserDetails,
  updateUserDetails
};
