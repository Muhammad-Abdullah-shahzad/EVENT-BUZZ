const express = require('express');
const router = express.Router();
const { createReview, getEventReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createReview);

router.route('/:eventId')
    .get(getEventReviews);

module.exports = router;
