import Cart from '../models/Cart.js';

export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });
  res.json(cart || { items: [] });
};

export const addToCart = async (req, res) => {
  const { productId, name, price, quantity } = req.body;
  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

  const itemIndex = cart.items.findIndex(i => i.productId === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ productId, name, price, quantity });
  }

  await cart.save();
  res.json(cart);
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.body;
  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  cart.items = cart.items.filter(i => i.productId !== productId);
  await cart.save();
  res.json(cart);
};
