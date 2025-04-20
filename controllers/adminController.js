const Feedback = require("../models/Feedback.js");
const Order = require("../models/Order.js");
const xlsx = require('xlsx');

const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate('userId', 'name email');
  res.json(orders);
};

const getAllFeedback = async (req, res) => {
  const feedback = await Feedback.find().populate('userId', 'name email');
  res.json(feedback);
};

const exportOrdersToExcel = async (req, res) => {
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


const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const update = { status };
    if (status.startsWith('shippedto')) {
      update.currentCity = status.replace('shippedto', '');
    }

    const order = await Order.findByIdAndUpdate(orderId, update, { new: true });

    // Email on delivery day
    if (status === 'deliveryday') {
      await sendEmail(order.userId, 'Your Order is Out for Delivery', `
        <h3>Your order will arrive today!</h3>
        <ul>
          ${order.items.map(i => `<li>${i.name} - ${i.quantity}</li>`).join('')}
        </ul>
      `);
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = {
  getAllOrders,
  getAllFeedback,
  exportOrdersToExcel,
  updateOrderStatus
};
