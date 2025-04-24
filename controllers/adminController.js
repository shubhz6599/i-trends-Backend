const Feedback = require("../models/Feedback.js");
const Order = require("../models/Order.js");
const xlsx = require('xlsx');

const getAllOrders = async (req, res) => {
  try {
    const { fromDate, toDate, userId, userName } = req.query;

    // Build the query object
    const query = {};

    // Filter by user ID
    if (userId) {
      query.userId = userId;
    }

    // Filter by user name (case-insensitive)
    if (userName) {
      query['userId.name'] = { $regex: userName, $options: 'i' };
    }

    // Filter by date range
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) {
        query.createdAt.$gte = new Date(fromDate); // Greater than or equal to fromDate
      }
      if (toDate) {
        query.createdAt.$lte = new Date(toDate); // Less than or equal to toDate
      }
    }

    // Fetch orders with full user and product details
    const orders = await Order.find(query)
      .populate('userId') // Populate all fields of the User document
      .populate('items.productId') // Populate all fields of the Product document
      .sort({ createdAt: -1 }); // Sort by newest orders first

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

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
