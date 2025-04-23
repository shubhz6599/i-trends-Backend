const Order = require('../models/Order');
const Cart = require('../models/Cart');
const sendEmail = require('../utils/sendEmail');
const User = require("../models/User");
const TempOrder = require("../models/TempOrder");

const placeOrder = async (req, res) => {
  try {
    const { razorpay_order_id, paymentId } = req.body; // Razorpay Order ID and Payment ID

    if (!razorpay_order_id || !paymentId) {
      console.error("Missing required fields: razorpay_order_id or paymentId");
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    console.log("Step 1: Received Razorpay Order ID:", razorpay_order_id);

    // Fetch TempOrder data using Razorpay Order ID
    const tempOrders = await TempOrder.find({ razorpay_order_id });
    if (!tempOrders || tempOrders.length === 0) {
      console.error("No temporary orders found for Razorpay Order ID:", razorpay_order_id);
      return res.status(404).json({ success: false, message: "No temporary orders found" });
    }

    console.log("Step 2: Temporary Orders Retrieved:", tempOrders);

    // Map TempOrder data to the items structure in Order schema
    const orderItems = tempOrders.map((item) => ({
      productId: item.productId, // Referenced Product ID
      quantity: item.quantity,
      price: item.price,
    }));

    console.log("Step 3: Order Items Mapped:", orderItems);

    // Calculate Total Amount
    const totalAmount = tempOrders.reduce((total, item) => total + item.price * item.quantity, 0);
    console.log("Step 4: Total Amount Calculated:", totalAmount);

    // Create the Order in the database
    const finalOrder = await Order.create({
      userId: req.user.id, // Attach the user ID from the authenticated user
      items: orderItems,
      totalAmount,
      paymentId, // Save the payment ID for reference
      status: "processing", // Default status
      createdAt: new Date(),
    });

    console.log("Step 5: Final Order Placed:", finalOrder);

    // Delete TempOrder entries after successful order creation
    await TempOrder.deleteMany({ razorpay_order_id });
    console.log("Step 6: Temporary Orders Deleted");

    res.json({
      success: true,
      message: "Order placed successfully",
      order: finalOrder,
    });
  } catch (error) {
    console.error("Error in placeOrder:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ _id: orderId, userId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  trackOrder
};
