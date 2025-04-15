import express from 'express';
import { getCart, addToCart, removeFromCart } from '../controllers/cartController.js';
import { placeOrder, getMyOrders, trackOrder } from '../controllers/orderController.js';
import { submitFeedback, getMyFeedback } from '../controllers/feedbackController.js';
import { getAllOrders, getAllFeedback, exportOrdersToExcel } from '../controllers/adminController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

// user
router.get('/cart', auth, getCart);
router.post('/cart', auth, addToCart);
router.delete('/cart', auth, removeFromCart);

router.post('/order', auth, placeOrder);
router.get('/orders', auth, getMyOrders);
router.get('/track/:orderId', auth, trackOrder);

router.post('/feedback', auth, submitFeedback);
router.get('/feedback', auth, getMyFeedback);

// admin
router.get('/admin/orders', getAllOrders);
router.get('/admin/feedback', getAllFeedback);
router.get('/admin/export-orders', exportOrdersToExcel);

export default router;
