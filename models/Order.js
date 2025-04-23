const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      variant: { type: String },
      imageUrl: { type: String },
      mainOption: { type: String },
      subOption: { type: String },
    },
  ],
  totalAmount: { type: Number, required: true },
  paymentId: { type: String, required: true },
  status: {
    type: String,
    enum: ['processing', 'confirmed', 'shipped', 'deliveryday', 'complete'],
    default: 'processing',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
