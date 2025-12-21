const express = require('express');
const router = express.Router();
const {
    getEvents,
    getEventById,
    createEvent,
    deleteEvent,
    updateEvent,
    getOrganizerEvents,
} = require('../controllers/eventController');
const { protect, organizer } = require('../middleware/authMiddleware');

// MUST BE FIRST to avoid being caught by /:id
router.get('/organizer/my-events', protect, organizer, getOrganizerEvents);

router.route('/')
    .get(getEvents)
    .post(protect, organizer, createEvent);

router.route('/:id')
    .get(getEventById)
    .put(protect, organizer, updateEvent)
    .delete(protect, deleteEvent);

module.exports = router;
