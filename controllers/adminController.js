const User = require("../models/User");
const Feedback = require("../models/Feedback.js");
const Order = require("../models/Order.js");
const exceljs = require("exceljs");
const sendDeliveryMail = require("../utils/sendOrderPlacedMail");


const getAllOrders = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: "Access denied" });

    const { from, to, userId, email, mobile } = req.query;
    const filters = {}; // Initialize an empty filter object

    // Filter by date range if 'from' and 'to' are provided
    if (from && to) {
      filters.createdAt = {
        $gte: new Date(new Date(from).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(to).setHours(23, 59, 59, 999))
      };
    }
    // Filter by userId, email, or mobile if provided
    if (userId || email || mobile) {
      const userQuery = {}; // Initialize a query object for users
      if (userId) userQuery._id = userId;
      if (email) userQuery.email = { $regex: new RegExp(email, "i") };  // Case-insensitive search
      if (mobile) userQuery.mobile = { $regex: new RegExp(mobile, "i") };  // Case-insensitive search

      // Fetch users based on the search terms
      const users = await User.find(userQuery);
      const userIds = users.map(u => u._id);
      filters.userId = { $in: userIds }; // Filter orders based on matched users
    }

    // Fetch orders based on the filters, or all if no filters
    const orders = await Order.find(filters)
      .populate("userId", "name email mobile") // Updated populate path
      .sort({ createdAt: -1 }); // Sort orders by creation date, descending

    // Send the response with the filtered orders and total count
    res.status(200).json({ total: orders.length, orders });
  } catch (err) {
    res.status(500).json({ msg: "Something went wrong" }); // Send generic error message
  }
};



const getAllFeedback = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: "Access denied" });

    const feedbacks = await Feedback.find({})
      .populate("user", "name email mobile")
      .sort({ createdAt: -1 });

    res.status(200).json({ total: feedbacks.length, feedbacks });
  } catch (err) {
    console.error("getAllFeedback error", err);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

const exportOrdersToExcel = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: "Access denied" });

    const { from, to, userId, email, mobile } = req.query;
    const filters = {};

    if (from && to) {
      filters.createdAt = {
        $gte: new Date(new Date(from).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(to).setHours(23, 59, 59, 999))
      };
    }

    if (userId || email || mobile) {
      const userQuery = {};
      if (userId) userQuery._id = userId;
      if (email) userQuery.email = { $regex: new RegExp(email, "i") };
      if (mobile) userQuery.mobile = { $regex: new RegExp(mobile, "i") };

      const users = await User.find(userQuery);
      const userIds = users.map(u => u._id);
      filters.userId = { $in: userIds };
    }

    const orders = await Order.find(filters).populate("userId", "name email mobile");


    const workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet("Orders");

    sheet.columns = [
      { header: "Order ID", key: "_id", width: 30 },
      { header: "User Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "mobile", key: "mobile", width: 15 },
      { header: "Total", key: "total", width: 15 },
      { header: "Status", key: "status", width: 20 },
      { header: "Date", key: "createdAt", width: 25 }
    ];

    orders.forEach(order => {
      sheet.addRow({
        _id: order._id,
        name: order.userId?.name || "N/A",
        email: order.userId?.email || "N/A",
        mobile: order.userId?.mobile || "N/A",

        total: order.total,
        status: order.status,
        createdAt: order.createdAt.toLocaleString()
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Orders_${Date.now()}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("exportOrdersToExcel error", err);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: "Access denied" });

    const orderId = req.body.orderId || req.params.orderId;
    const status = req.body.status;

    if (!orderId || !status) {
      return res.status(400).json({ msg: "Order ID and status are required" });
    }

    const order = await Order.findById(orderId).populate("userId", "name email");

    if (!order) return res.status(404).json({ msg: "Order not found" });

    order.status = status;
    await order.save();

    if (status === "deliveryday") {
      await sendDeliveryMail(order);
    }

    res.status(200).json({ msg: "Status updated", order });
  } catch (err) {
    console.error("updateOrderStatus error", err);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

module.exports = {
  getAllOrders,
  getAllFeedback,
  exportOrdersToExcel,
  updateOrderStatus
};
