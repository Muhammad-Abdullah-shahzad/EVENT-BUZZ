const express = require('express');
const router = express.Router();
const {
    createCheckoutSession,
    handlePayFastCallback,
    verifyPayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-session', protect, createCheckoutSession);
router.post('/payfast-callback', handlePayFastCallback);
router.post('/verify', protect, verifyPayment);
router.post('/', protect, createCheckoutSession); // Fallback

module.exports = router;
