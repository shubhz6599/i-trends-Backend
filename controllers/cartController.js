const Cart = require("../models/Cart.js");

const getCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });
  res.json(cart || { items: [] });
};

 const addToCart = async (req, res) => {
  const { productId, name, price, quantity, img } = req.body; // Include `img` in the request body
  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

  const itemIndex = cart.items.findIndex((i) => i.productId === productId);
  if (itemIndex > -1) {
    // Update quantity if the product already exists in the cart
    cart.items[itemIndex].quantity += quantity;
  } else {
    // Add new product to the cart
    cart.items.push({ productId, name, price, quantity, img });
  }

  await cart.save();
  res.json(cart);
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
