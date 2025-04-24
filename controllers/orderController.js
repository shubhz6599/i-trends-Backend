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
    const totalAmount = tempOrders.reduce((total, item) => total + item.price, 0);
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

const confirmOrder = async (req, res) => {
  try {
    const { paymentId, totalAmount, items } = req.body;
    const userId = req.user._id;

    const existingOrder = await Order.findOne({ paymentId });
    if (existingOrder) {
      return res.status(200).json({ success: true, message: "Order already confirmed", order: existingOrder });
    }

    const newOrder = await Order.create({ userId, items, totalAmount, paymentId });
    res.status(201).json({ success: true, message: "Order confirmed", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Failed to confirm order" });
  }
};



const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.user.id; // Get the logged-in user's ID from the token (middleware should decode this)

    // Fetch all orders for the user
    const orders = await Order.find({ userId }).select('-__v -createdAt'); // Exclude unnecessary fields

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'No orders found for this user' });
    }

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const getOrderDetailsById = async (req, res) => {
  try {
    const { orderId } = req.params; // Extract orderId from the request parameters

    // Fetch the order by ID
    const order = await Order.findById(orderId)
      .populate('userId', 'name email phone address') // Populate user details
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      order: {
        user: {
          name: order.userId.name,
          email: order.userId.email,
          phone: order.userId.phone,
          address: order.userId.address,
        },
        items: order.items.map((item) => ({
          productId:item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant,
          description: item.description,
          features: item.features,
          imageUrl: item.imageUrl,
        })),
        totalAmount: order.totalAmount,
        paymentId: order.paymentId,
        status: order.status,
      },
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
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
  confirmOrder,
  getOrdersByUser,
  getOrderDetailsById,
  getMyOrders,
  trackOrder
};
