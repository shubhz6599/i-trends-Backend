const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const otpCache = require("../utils/otpCache");
const Payment = require("../models/payment")
const razorpayInstance = require("../middleware/razorPayInstance")
const TempOrder = require("../models/TempOrder")

const signup = async (req, res) => {
  const { name, email, password, dob, mobile } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min

    otpCache.set(email, {
      userData: { name, email, password, dob, mobile },
      otp,
      otpExpiry,
    });

    await sendEmail(
      email,
      "Verify Your Email",
      `<p>Your OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`
    );

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const cached = otpCache.get(email);

    if (!cached) return res.status(400).json({ message: "No OTP request found" });
    if (cached.otp != otp || cached.otpExpiry < Date.now())
      return res.status(400).json({ message: "Invalid or expired OTP" });

    // Save user to DB after successful OTP
    const hashed = await bcrypt.hash(cached.userData.password, 10);
    const user = await User.create({
      ...cached.userData,
      password: hashed,
      isOtpVerified: true,
    });

    otpCache.delete(email); // remove temp cache

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    await sendEmail(
      user.email,
      "OTP Verified",
      `<p>Your email is verified. You can now login.</p>`
    );

    res.json({ message: "Email verified successfully", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const now = Date.now();

    // Enforce the 24-hour limit
    if (user.resendOtpCount >= 3 && user.lastResendTimestamp && now - user.lastResendTimestamp.getTime() < 24 * 60 * 60 * 1000) {
      return res.status(429).json({ message: "You have exceeded the OTP resend limit. Please try again after 24 hours." });
    }

    // Reset count if 24 hours have passed since last resend
    if (user.lastResendTimestamp && now - user.lastResendTimestamp.getTime() >= 24 * 60 * 60 * 1000) {
      user.resendOtpCount = 0; // Reset resend count
    }

    // Generate a new OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    user.otp = otp;
    user.otpExpiry = Date.now() + 300000; // OTP valid for 5 minutes
    user.resendOtpCount += 1;
    user.lastResendTimestamp = new Date();
    
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

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin }, // ✅ Add this
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
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

    const resetLink = `https://i-trends-85dd4.web.app/reset-password/${token}`;
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
       user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob, // Include date of birth
        phone: user.mobile, // Include phone number
        isOtpVerified: user.isOtpVerified,
        resendOtpCount: user.resendOtpCount,
      },
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

const createOrder = async (req, res) => {
  const { items, amount } = req.body; // Receive product details and amount from frontend

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: "No items provided for order" });
  }

  const paymentOptions = {
    amount: amount * 100, // Convert to smallest currency unit (e.g., paise for INR)
    currency: "INR",
    receipt: "receipt_" + new Date().getTime(),
    payment_capture: 1, // Auto-capture payment
  };

  try {
    const razorpayResponse = await razorpayInstance.orders.create(paymentOptions);

    // Store Razorpay order ID and product details temporarily in the database
    const tempOrder = {
      razorpay_order_id: razorpayResponse.id, // Razorpay Order ID
      items, // Store product details
      amount,
      status: "created", // Initially set status as "created"
    };

    await TempOrder.create(tempOrder); // Save to TempOrder collection

    res.json({ success: true, order: razorpayResponse });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    console.log("Request received for payment verification:", req.body);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Generate signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    console.log("Generated Signature:", generatedSignature);
    console.log("Received Signature:", razorpay_signature);

    if (generatedSignature === razorpay_signature) {
      console.log("Payment verified successfully");

      // Update temporary order status to "verified"
      const tempOrder = await TempOrder.findOne({ razorpay_order_id });

      if (!tempOrder) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      tempOrder.status = "verified"; // Update status to "verified"
      await tempOrder.save();

      res.json({
        success: true,
        message: "Payment verified successfully",
        order: tempOrder,
      });
    } else {
      console.error("Signature mismatch!");
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
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
};
