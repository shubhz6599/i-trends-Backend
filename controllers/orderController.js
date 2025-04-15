import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import sendEmail from '../utils/sendEmail.js';

export const placeOrder = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

  const totalAmount = cart.items.reduce((total, i) => total + i.price * i.quantity, 0);
  const order = await Order.create({ userId: req.user.id, items: cart.items, totalAmount });

  await Cart.deleteOne({ userId: req.user.id });

  await sendEmail(req.user.email, 'Order Placed', `<h3>Your order has been placed!</h3>`);
  res.json(order);
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user.id });
  res.json(orders);
};

export const trackOrder = async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findOne({ _id: orderId, userId: req.user.id });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
};
