const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      productId: String,
      productType: String,
      name: String,
      price: Number,
      quantity: Number,
      img: String,
      actualPrice: String,
      discountedPrice: String,
      ratings: String,
      description: String,
      userSelectionDetails: {
        type: mongoose.Schema.Types.Mixed, // Store contact lens details here
        required: false,
      },
    },
  ],
});



module.exports = mongoose.model('Cart', cartSchema);
