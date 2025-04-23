const Order = require('../models/Order');
const Cart = require('../models/Cart');
const sendEmail = require('../utils/sendEmail');
const User = require("../models/User");
const TempOrder = require("../models/TempOrder");

const placeOrder = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    console.log("Received request to place order with Razorpay Order ID:", razorpay_order_id);

    // Fetch the TempOrder using the Razorpay Order ID
    const tempOrders = await TempOrder.find({ razorpay_order_id });
    if (!tempOrders || tempOrders.length === 0) {
      console.error("No temporary order found for Razorpay Order ID:", razorpay_order_id);
      return res.status(404).json({ success: false, message: "No temporary order found" });
    }

    console.log("Temp orders found:", tempOrders);

    // Create a final order
    const finalOrder = await Order.create({
      userId: req.user.id,
      items: tempOrders.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: tempOrders.reduce((total, item) => total + item.price * item.quantity, 0),
    });

    console.log("Final order created successfully:", finalOrder);

    // Delete TempOrder after creating the final order
    await TempOrder.deleteMany({ razorpay_order_id });

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
