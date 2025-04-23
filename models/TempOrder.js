const mongoose = require("mongoose");

const tempOrderSchema = new mongoose.Schema({
  razorpay_order_id: { type: String, required: true },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  amount: { type: Number, required: true },
  status: { type: String, default: "created" }, // "created", "verified", etc.
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TempOrder", tempOrderSchema);
