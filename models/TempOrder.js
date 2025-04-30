const mongoose = require('mongoose');

const tempOrderSchema = new mongoose.Schema({
  razorpay_order_id: { type: String, required: true },
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  variant: { type: String },
  imageUrl: { type: String },
  mainOption: { type: String },
  subOption: { type: String },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['created', 'verified'], default: 'created' },
  createdAt: { type: Date, default: Date.now },
  productType: {
    type: String,
    enum: ['specs', 'eyewear', 'contact-lens'],
    required: true,
  },
});

module.exports = mongoose.model('TempOrder', tempOrderSchema);
