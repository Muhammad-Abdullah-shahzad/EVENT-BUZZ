const express = require('express');
const router = express.Router();
const {
    getEvents,
    getEventById,
    createEvent,
    deleteEvent,
    updateEvent,
    getOrganizerEvents,
    approveEvent,
    rejectEvent,
    getPendingEvents,
} = require('../controllers/eventController');
const { protect, organizer, admin } = require('../middleware/authMiddleware');

// Admin Routes (MUST BE BEFORE /:id)
router.get('/admin/pending', protect, admin, getPendingEvents);
router.put('/:id/approve', protect, admin, approveEvent);
router.put('/:id/reject', protect, admin, rejectEvent);

// Organizer Routes
router.get('/organizer/my-events', protect, organizer, getOrganizerEvents);

router.route('/')
    .get(getEvents)
    .post(protect, organizer, createEvent);

router.route('/:id')
    .get(getEventById)
    .put(protect, organizer, updateEvent)
    .delete(protect, deleteEvent);

module.exports = router;
