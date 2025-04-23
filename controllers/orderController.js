const Order = require('../models/Order');
const Cart = require('../models/Cart');
const sendEmail = require('../utils/sendEmail');
const User = require("../models/User");
const TempOrder = require("../models/TempOrder");

const placeOrder = async (req, res) => {
  const { razorpay_order_id, paymentId } = req.body;

  if (!razorpay_order_id || !paymentId) {
    return res.status(400).json({ success: false, message: "Missing required fields: razorpay_order_id or paymentId" });
  }

  try {
    console.log("Step 1: Received Razorpay Order ID:", razorpay_order_id);
    console.log("Step 2: Received Payment ID:", paymentId);

    // Fetch verified TempOrder entries related to the Razorpay Order ID
    const tempOrders = await TempOrder.find({ razorpay_order_id, status: "verified" });

    if (!tempOrders || tempOrders.length === 0) {
      return res.status(404).json({ success: false, message: "No verified temporary orders found" });
    }

    console.log("Step 3: Verified TempOrders Retrieved:", tempOrders);

    // Map TempOrder data to match the Order schema
    const orderItems = tempOrders.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      variant: item.variant,
      imageUrl: item.imageUrl,
      mainOption: item.mainOption,
      subOption: item.subOption,
    }));

    console.log("Step 4: Order Items Mapped:", orderItems);

    // Calculate the total amount
    const totalAmount = tempOrders.reduce((total, item) => total + item.price * item.quantity, 0);
    console.log("Step 5: Total Amount Calculated:", totalAmount);

    // Create the final order
    const finalOrder = await Order.create({
      userId: req.user.id, // Attach authenticated user's ID
      items: orderItems,
      totalAmount,
      paymentId, // Save payment ID for reference
      status: "processing",
    });

    console.log("Step 6: Final Order Created:", finalOrder);

    // Delete TempOrder entries related to the Razorpay Order ID
    await TempOrder.deleteMany({ razorpay_order_id });
    console.log("Step 7: TempOrders Deleted");

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
