const mongoose = require('mongoose');

const tempOrderSchema = new mongoose.Schema({
  razorpay_order_id: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Referenced Product ID
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

module.exports = mongoose.model('TempOrder', tempOrderSchema);
