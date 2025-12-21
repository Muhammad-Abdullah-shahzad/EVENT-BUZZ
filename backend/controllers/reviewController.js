const Review = require('../models/Review');
const Event = require('../models/Event');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    const { rating, comment, eventId } = req.body;

    try {
        const event = await Event.findById(eventId);

        if (!event) {
            res.status(404);
            throw new Error('Event not found');
        }

        const alreadyReviewed = await Review.findOne({
            user: req.user._id,
            event: eventId
        });

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('You have already reviewed this event');
        }

        const review = await Review.create({
            user: req.user._id,
            event: eventId,
            rating: Number(rating),
            comment,
            user_name: req.user.name // Store name for easier access or populate
        });

        // Recalculate average rating for event (optional/advanced: do this in a hook or aggregation)
        // For simplicity, we can do it here or just fetch reviews on frontend.

        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get reviews for an event
// @route   GET /api/reviews/:eventId
// @access  Public
const getEventReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ event: req.params.eventId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReview,
    getEventReviews
};
