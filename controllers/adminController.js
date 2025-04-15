import Feedback from '../models/Feedback.js';
import Order from '../models/Order.js';
import xlsx from 'xlsx';

export const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate('userId', 'name email');
  res.json(orders);
};

export const getAllFeedback = async (req, res) => {
  const feedback = await Feedback.find().populate('userId', 'name email');
  res.json(feedback);
};

export const exportOrdersToExcel = async (req, res) => {
  const orders = await Order.find().populate('userId', 'name email');
  const data = orders.map(o => ({
    name: o.userId.name,
    email: o.userId.email,
    totalAmount: o.totalAmount,
    items: o.items.length,
    status: o.status
  }));
  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Orders');
  const filePath = '/tmp/orders.xlsx';
  xlsx.writeFile(wb, filePath);
  res.download(filePath);
};