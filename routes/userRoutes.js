const express = require('express');
// const { getCart, addToCart, removeFromCart } = require('../controllers/cartController.js');
// const { placeOrder, getMyOrders, trackOrder } = require('../controllers/orderController.js');
const { submitFeedback, getMyFeedback } = require('../controllers/feedbackController.js');
// const { getAllOrders, getAllFeedback, exportOrdersToExcel } = require('../controllers/adminController.js');
const authenticate = require('../middleware/authMiddleware.js');

const router = express.Router();

// // user
router.get('/cart', authenticate, getCart);
router.post('/cart', authenticate, addToCart);
router.delete('/cart', authenticate, removeFromCart);

// router.post('/order', authenticate, placeOrder);
// router.get('/orders', authenticate, getMyOrders);
// router.get('/track/:orderId', authenticate, trackOrder);

router.post('/feedback', authenticate, submitFeedback);
router.get('/feedback', authenticate, getMyFeedback);

// admin
// router.get('/admin/orders', getAllOrders);
// router.get('/admin/feedback', getAllFeedback);
// router.get('/admin/export-orders', exportOrdersToExcel);

module.exports = router;
