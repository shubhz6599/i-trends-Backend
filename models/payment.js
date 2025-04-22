const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    order_id: String,
    payment_id: String,
    signature: String,
    amount: Number,
    status: String,
    createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);