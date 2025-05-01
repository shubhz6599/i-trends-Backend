const nodemailer = require("nodemailer");

const statusSubjects = {
  processing: "🛒 Your Order is Processing",
  confirmed: "✅ Your Order is Confirmed",
  shippedtopune: "🚚 Your Order Has Been Shipped to Pune",
  deliveryday: "📦 Out for Delivery Today!",
  complete: "🎉 Order Delivered Successfully"
};

const statusMessages = {
  processing: "We have received your order and it's now being processed.",
  confirmed: "Your order has been confirmed and will be packed soon.",
  shippedtopune: "Your order has been shipped and is on its way to Pune.",
  deliveryday: "Your order is out for delivery today. Keep your phone nearby!",
  complete: "Your order has been delivered. We hope you love it!"
};

const sendOrderStatusMail = async (order, status) => {
  if (!order?.userId?.email || !statusSubjects[status]) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const subject = statusSubjects[status];
  const message = statusMessages[status];

  const html = `
    <h2>Hi ${order.userId.name},</h2>
    <p>${message}</p>
    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>Total:</strong> ₹${order.totalAmount}</p>
    <p><strong>Payment ID:</strong> ${order.paymentId}</p>
    <p><strong>Items:</strong></p>
    <ul>
      ${order.items.map(p => `<li>${p.name} - Qty: ${p.quantity} - ₹${p.price}</li>`).join("")}
    </ul>
    <p>Thank you for shopping with us!</p>
  `;

  await transporter.sendMail({
    from: `"i-trends" <${process.env.EMAIL_USER}>`,
    to: order.userId.email,
    subject,
    html
  });
};

module.exports = sendOrderStatusMail;
