const nodemailer = require("nodemailer");

const sendOrderPlacedMail = async (order) => {
  if (!order?.userId?.email) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const html = `
    <h2>Hi ${order.userId.name},</h2>
    <p>Your order has been successfully placed! 🎉</p>
    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>Total:</strong> ₹${order.totalAmount}</p>
    <p><strong>Payment ID:</strong> ${order.paymentId}</p>
    <p><strong>Items:</strong></p>
    <ul>
      ${order.items.map(p => `<li>${p.name} - Qty: ${p.quantity} - ₹${p.price}</li>`).join("")}
    </ul>
    <p>We’ll keep you posted about shipping and delivery. Thank you for shopping with us!</p>
  `;

  await transporter.sendMail({
    from: `"My E-Commerce" <${process.env.EMAIL_USER}>`,
    to: order.userId.email,
    subject: "🎉 Your Order is Confirmed!",
    html
  });
};

module.exports = sendOrderPlacedMail;
