const Order = require('../models/Order');
const Cart = require('../models/Cart');
const sendEmail = require('../utils/sendEmail');
const User = require("../models/User");
const TempOrder = require("../models/TempOrder");

const placeOrder = async (req, res) => {
  const { razorpay_order_id } = req.body;

  try {
    const tempOrder = await TempOrder.findOne({ razorpay_order_id, status: "verified" });

    if (!tempOrder) {
      return res.status(404).json({ success: false, message: "Verified order not found" });
    }

    // Create the final order using TempOrder data
    const finalOrder = await Order.create({
      userId: req.user.id,
      items: tempOrder.items, // Retrieve product details from TempOrder
      totalAmount: tempOrder.amount,
    });

    console.log("Order placed successfully:", finalOrder);

    // Delete TempOrder after successful order placement
    await TempOrder.deleteOne({ razorpay_order_id });

    res.json({
      success: true,
      message: "Order placed successfully",
      order: finalOrder,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
