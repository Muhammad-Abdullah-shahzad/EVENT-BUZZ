const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
    try {
        const keyword = req.query.keyword
            ? {
                title: {
                    $regex: req.query.keyword,
                    $options: 'i',
                },
            }
            : {};

        const { category, minPrice, maxPrice, date, lat, lng, distance } = req.query;
        let filters = { ...keyword };

        if (category && category !== 'All') {
            filters.category = category;
        }

        if (minPrice || maxPrice) {
            filters.ticketPrice = {};
            if (minPrice) filters.ticketPrice.$gte = Number(minPrice);
            if (maxPrice) filters.ticketPrice.$lte = Number(maxPrice);
        }

        if (date) {
            filters.date = { $gte: new Date(date) };
        }

        if (lat && lng) {
            filters.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)],
                    },
                    $maxDistance: (parseFloat(distance) || 25) * 1000, // Convert km to meters
                },
            };
        }

        const events = await Event.find(filters).populate('user', 'name');

        // Note: .sort() cannot be used with $near if you want distance sorting 
        // as $near already sorts by proximity. 
        if (!lat || !lng) {
            events.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('user', 'name');

        if (event) {
            res.json(event);
        } else {
            res.status(404);
            throw new Error('Event not found');
        }
    } catch (error) {
        res.status(404).json({ message: 'Event not found' });
    }
};

// @desc    Create a event
// @route   POST /api/events
// @access  Private/Organizer
const createEvent = async (req, res) => {
    const {
        title,
        description,
        category,
        date,
        venue,
        address,
        location,
        ticketPrice,
        capacity,
        image
    } = req.body;

    try {
        const event = new Event({
            user: req.user._id,
            title,
            description,
            category,
            date,
            venue,
            address,
            location,
            ticketPrice,
            capacity,
            image,
            isPaid: ticketPrice > 0
        });

        const createdEvent = await event.save();
        res.status(201).json(createdEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Organizer/Admin
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            // Check if user is event owner or admin
            if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                res.status(401);
                throw new Error('Not authorized to delete this event');
            }

            await event.deleteOne();
            res.json({ message: 'Event removed' });
        } else {
            res.status(404);
            throw new Error('Event not found');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get organizer events
// @route   GET /api/events/organizer/my-events
// @access  Private/Organizer
const getOrganizerEvents = async (req, res) => {
    try {
        const fs = require('fs');
        const logFile = './debug_local.log';
        fs.appendFileSync(logFile, `Hit getOrganizerEvents for ${req.user?._id}\n`);

        const events = await Event.find({ user: req.user._id }).sort({ date: 1 });

        if (events.length === 0) {
            fs.appendFileSync(logFile, `Returning mock event\n`);
            return res.json([{
                _id: 'mock_debug_123',
                title: 'DEBUG: Connection Working',
                category: 'Test',
                date: new Date(),
                venue: 'Local Server',
                ticketsSold: 0,
                capacity: 100,
                image: 'https://via.placeholder.com/40'
            }]);
        }

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Organizer
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            // Check if user is event owner or admin
            if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                res.status(401);
                throw new Error('Not authorized to update this event');
            }

            event.title = req.body.title || event.title;
            event.description = req.body.description || event.description;
            event.category = req.body.category || event.category;
            event.date = req.body.date || event.date;
            event.venue = req.body.venue || event.venue;
            event.address = req.body.address || event.address;
            event.ticketPrice = req.body.ticketPrice ?? event.ticketPrice;
            event.capacity = req.body.capacity ?? event.capacity;
            event.image = req.body.image || event.image;
            event.isPaid = event.ticketPrice > 0;

            const updatedEvent = await event.save();
            res.json(updatedEvent);
        } else {
            res.status(404);
            throw new Error('Event not found');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    deleteEvent,
    updateEvent,
    getOrganizerEvents,
};
