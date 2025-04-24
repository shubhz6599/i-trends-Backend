const Cart = require("../models/Cart.js");

const getCart = async (req, res) => {
  const { userId } = req.params; // Assuming userId is passed as a route parameter

  try {
    // Find the cart for the user
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to retrieve cart.' });
  }
};

const addToCart = async (req, res) => {
  const { userId, productId, name, price, quantity, imageUrl, actualPrice, discountedPrice, ratings, description } = req.body;

  try {
    // Find the cart for the user
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // If no cart exists for the user, create a new one
      cart = new Cart({ userId, items: [] });
    }

    // Check if the product is already in the cart
    const existingItem = cart.items.find((item) => item.productId === productId);

    if (existingItem) {
      // Update the quantity if the product already exists in the cart
      existingItem.quantity += quantity;
    } else {
      // Add a new product to the cart
      cart.items.push({
        productId,
        name,
        price,
        quantity,
        img: imageUrl,
        actualPrice: actualPrice || price, // Fallback to price if actualPrice is not provided
        discountedPrice: discountedPrice || price, // Fallback to price if discountedPrice is not provided
        ratings: ratings || '4.5', // Default rating if not provided
        description: description || 'A high-quality product.', // Default description if not provided
      });
    }

    // Save the updated cart
    await cart.save();

    res.status(200).json({ success: true, message: 'Product added to cart successfully.', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to add product to cart.' });
  }
};



const removeFromCart = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    // Find the cart for the user
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    // Remove the item with the specified productId
    cart.items = cart.items.filter((item) => item.productId !== productId);

    // Save the updated cart
    await cart.save();

    res.status(200).json({ success: true, message: 'Product removed from cart successfully.', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to remove product from cart.' });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart
};
