const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
      img: String,
      actualPrice: String, 
      discountedPrice: String, 
      ratings: String, 
      description: String
    },
  ],
});

  

module.exports = mongoose.model('Cart', cartSchema);
