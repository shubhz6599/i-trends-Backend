const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: Array,
    totalAmount: Number,
    status: { type: String, default: 'Processing' },
    createdAt: { type: Date, default: Date.now },
  });
  
module.exports = mongoose.model('Order', orderSchema);
