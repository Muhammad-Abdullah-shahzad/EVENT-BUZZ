const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, cancelBooking, getPublicTicket } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.get('/public/:id', getPublicTicket);

router.route('/')
    .post(protect, createBooking)
    .get(protect, getMyBookings);

router.route('/:id/cancel').put(protect, cancelBooking);

module.exports = router;
