const Order = require('../models/Order');
const Cart = require('../models/Cart');
const sendEmail = require('../utils/sendEmail');
const User = require("../models/User");

const placeOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // 👈 Get full user including email
    if (!user) return res.status(404).json({ message: 'User not found' });

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const totalAmount = cart.items.reduce((total, i) => {
      const price = Number(i.discountedPrice ?? i.price ?? i.actualPrice ?? 0);
      const qty = Number(i.quantity ?? 1);
      return total + price * qty;
    }, 0);

    const order = await Order.create({
      userId: req.user.id,
      items: cart.items,
      totalAmount,
    });

    await Cart.deleteOne({ userId: req.user.id });

    await sendEmail(user.email, 'Order Placed', `<h3>Your order has been placed!</h3>`);
    res.json(order);
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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