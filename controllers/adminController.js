const Feedback = require("../models/Feedback.js");
const Order = require("../models/Order.js");
const xlsx = require('xlsx');
const fs = require('fs');


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
      query.userId = { $regex: userName, $options: 'i' }; // Use regex for case-insensitive match
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
      .populate('userId', 'name email phone address') // Populate user details
      .sort({ createdAt: -1 }); // Sort by newest orders first

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const { userId, userName } = req.query;

    // Build the query object
    const query = {};

    // Filter by user ID
    if (userId) {
      query.userId = userId;
    }

    // Filter by user name (case-insensitive)
    if (userName) {
      query.userId = { $regex: userName, $options: 'i' }; // Use regex for case-insensitive match
    }

    // Fetch feedback with full user details
    const feedback = await Feedback.find(query).populate('userId', 'name email phone'); // Populate user details

    res.json({ success: true, feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const exportOrdersToExcel = async (req, res) => {
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
      query.userId = { $regex: userName, $options: 'i' };
    }

    // Filter by date range
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) {
        query.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        query.createdAt.$lte = new Date(toDate);
      }
    }

    // Fetch orders with full user and product details
    const orders = await Order.find(query)
      .populate('userId', 'name email phone') // Fetch full user details
      .sort({ createdAt: -1 });

    // Map orders into a format suitable for Excel
    const data = orders.map((o) => ({
      OrderID: o._id,
      UserName: o.userId.name,
      UserEmail: o.userId.email,
      TotalAmount: o.totalAmount,
      Items: o.items.map((item) => `${item.name} (${item.quantity})`).join(', '),
      Status: o.status,
      CreatedAt: o.createdAt.toISOString(),
    }));

    // Create Excel sheet
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Orders');

    // Save file to temporary location
    const filePath = './orders.xlsx';
    xlsx.writeFile(wb, filePath);

    // Send file for download
    res.download(filePath, 'orders.xlsx', (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      fs.unlinkSync(filePath); // Clean up the file after sending
    });
  } catch (error) {
    console.error('Error exporting orders to Excel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const update = { status };

    // Update current city if status starts with "shippedto"
    if (status.startsWith('shippedto')) {
      update.shippedTo = status.replace('shippedto', '');
    }

    // Set delivery date if status is "deliveryday"
    if (status === 'deliveryday') {
      update.deliveryDate = new Date();
    }

    // Set deliveredAt date if status is "complete"
    if (status === 'complete') {
      update.deliveredAt = new Date();
    }

    // Find and update the order
    const order = await Order.findByIdAndUpdate(orderId, update, { new: true })
      .populate('userId', 'name email phone') // Populate user details
      .populate('items.productId'); // Populate product details

    // If order is not found
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Send email notification on "delivery day"
    if (status === 'deliveryday') {
      const emailBody = `
        <h3>Your order is out for delivery!</h3>
        <p>Here are the details of your order:</p>
        <ul>
          ${order.items.map((i) => `<li>${i.name} - Quantity: ${i.quantity}</li>`).join('')}
        </ul>
        <p>Total Amount: ₹${order.totalAmount}</p>
      `;
      await sendEmail(order.userId.email, 'Your Order is Out for Delivery', emailBody);
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getAllOrders,
  getAllFeedback,
  exportOrdersToExcel,
  updateOrderStatus
};
