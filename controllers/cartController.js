const Cart = require("../models/Cart.js");

const getCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });
    const cartWithDetails = cart?.items.map((item) => ({
    productId: item.productId,
    name: item.name,
    img: item.img,
    quantity: item.quantity,
    actualPrice: item.actualPrice || item.price, // Add actual price
    discountedPrice: item.discountedPrice || item.price, // Add discounted price
    ratings: item.ratings || 4.5, // Add ratings
    description: item.description || 'A high-quality product.', // Add description
  }));

  res.json(cartWithDetails || []);
};

const addToCart = async (req, res) => {
  try {
    const { productId, name, quantity, img, actualPrice, discountedPrice, ratings, description } = req.body; // Extract product details from the request body
    let cart = await Cart.findOne({ userId: req.user.id }); // Find the cart for the logged-in user

    if (!cart) {
      // If no cart exists for the user, create a new cart
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    // Check if the product already exists in the user's cart
    const itemIndex = cart.items.findIndex((i) => i.productId === productId);

    if (itemIndex > -1) {
      // If the product already exists in the cart, return a validation error
      return res.status(400).json({
        success: false,
        message: "Product is already in your cart.",
      });
    }

    // Add the new product to the cart
    cart.items.push({ productId, name, quantity, img, actualPrice, discountedPrice, ratings, description });

    await cart.save(); // Save the updated cart
    res.json({
      success: true,
      message: "Product added to cart successfully.",
      cart,
    });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the product to the cart.",
    });
  }
};
const removeFromCart = async (req, res) => {
  const { productId } = req.body;
  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  cart.items = cart.items.filter(i => i.productId !== productId);
  await cart.save();
  res.json(cart);
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart
};
