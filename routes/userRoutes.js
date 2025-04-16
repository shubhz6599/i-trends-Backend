const express = require('express');
// const { getCart, addToCart, removeFromCart } = require('../controllers/cartController.js');
// const { placeOrder, getMyOrders, trackOrder } = require('../controllers/orderController.js');
const { submitFeedback, getMyFeedback } = require('../controllers/feedbackController.js');
// const { getAllOrders, getAllFeedback, exportOrdersToExcel } = require('../controllers/adminController.js');
const auth = require('../middleware/authMiddleware.js');

const router = express.Router();

// // user
// router.get('/cart', auth, getCart);
// router.post('/cart', auth, addToCart);
// router.delete('/cart', auth, removeFromCart);

// router.post('/order', auth, placeOrder);
// router.get('/orders', auth, getMyOrders);
// router.get('/track/:orderId', auth, trackOrder);

router.post('/feedback', auth, submitFeedback);
router.get('/feedback', auth, getMyFeedback);

// admin
// router.get('/admin/orders', getAllOrders);
// router.get('/admin/feedback', getAllFeedback);
// router.get('/admin/export-orders', exportOrdersToExcel);

module.exports = router;
