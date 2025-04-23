const express = require('express');
const { getCart, addToCart, removeFromCart } = require('../controllers/cartController.js');
const { placeOrder,confirmOrder,getOrdersByUser, getOrderDetailsById, getMyOrders, trackOrder } = require('../controllers/orderController.js');
const { submitFeedback, getMyFeedback } = require('../controllers/feedbackController.js');
const { getAllOrders, getAllFeedback, exportOrdersToExcel, updateOrderStatus } = require('../controllers/adminController.js');
const authenticate = require('../middleware/authMiddleware.js');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// // user
router.get('/cart', authenticate, getCart);
router.post('/cart', authenticate, addToCart);
router.delete('/cart', authenticate, removeFromCart);

router.post('/order', authenticate, placeOrder);
router.post('/confirm-order', authenticate, confirmOrder);
router.get('/user-orders', authenticate, getOrdersByUser);
router.get('/:orderId', authenticate, getOrderDetailsById);
router.get('/orders', authenticate, getMyOrders);
router.get('/track/:orderId', authenticate, trackOrder);

router.post('/feedback', authenticate, submitFeedback);
router.get('/feedback', authenticate, getMyFeedback);

// admin

router.get('/orders', authenticate, isAdmin, getAllOrders);
router.get('/feedback', authenticate, isAdmin, getAllFeedback);
router.post('/export', authenticate, isAdmin, exportOrdersToExcel);
// router.put('/order-status/:orderId', updateOrderStatus);
router.put('/order-status/:orderId', authenticate, isAdmin, updateOrderStatus);


module.exports = router;
