const mongoose = require('mongoose');

const tempOrderSchema = new mongoose.Schema({
  razorpay_order_id: { type: String, required: true },
  productId: { type: String, required: true }, // Product ID
  name: { type: String, required: true }, // Product name
  price: { type: Number, required: true }, // Price of the product
  quantity: { type: Number, required: true }, // Quantity of the product
  variant: { type: String }, // Optional: Variant of the product
  imageUrl: { type: String }, // Optional: Image URL of the product
  mainOption: { type: String }, // Optional: Main option selected
  subOption: { type: String }, // Optional: Sub option selected
  amount: { type: Number, required: true }, // Total amount
  status: { type: String, enum: ['created', 'verified'], default: 'created' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TempOrder', tempOrderSchema);
