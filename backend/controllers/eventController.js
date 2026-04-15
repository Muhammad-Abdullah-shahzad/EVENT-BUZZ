const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationUtils');

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

        const { category, minPrice, maxPrice, date, lat, lng, distance, status } = req.query;
        let filters = { ...keyword };

        if (date) {
            filters.date = { $gte: new Date(date) };
        } else if (!req.query.includePast) {
            // Default: Only show upcoming events (including today's events)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            filters.date = { $gte: today };
        }

        // Strictly enforce approved events for public. 
        // Exclude archived events unless specifically requested.
        if (status && req.user && req.user.role === 'admin') {
            filters.status = status;
        } else {
            filters.status = 'approved';
            // Ensure archived events are not shown to public users
            if (!filters.$and) {
                filters.$and = [];
            }
            filters.$and.push({ status: { $ne: 'archived' } });
        }

        if (category && category !== 'All') {
            filters.category = category;
        }

        if (minPrice || maxPrice) {
            filters.ticketPrice = {};
            if (minPrice) filters.ticketPrice.$gte = Number(minPrice);
            if (maxPrice) filters.ticketPrice.$lte = Number(maxPrice);
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
        const event = await Event.findById(req.params.id).populate('user', 'name email');

        if (event) {
            // If event is not approved, only let admin or owner see it
            if (event.status !== 'approved') {
                // We need to check if user is authenticated and authorized
                // But this route is public. Let's see if we can get user from token if present.
                // For simplicity, if it's public and not approved, return 404.
                // The organizer has their own dashboard to view their events.
                res.status(404);
                throw new Error('Event not found or pending approval');
            }
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
        image,
        gallery
    } = req.body;

    try {
        const existingEvent = await Event.findOne({
            title: { $regex: new RegExp(`^${title.trim()}$`, 'i') },
            venue: { $regex: new RegExp(`^${venue.trim()}$`, 'i') },
            date: new Date(date)
        });

        if (existingEvent) {
            res.status(400);
            throw new Error('Duplicate event detected: An event with this title and date is already listed at this venue.');
        }

        const eventStatus = (req.user.role && req.user.role.toLowerCase() === 'admin') ? 'approved' : 'pending';

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
            gallery: gallery || [],
            isPaid: ticketPrice > 0,
            status: eventStatus
        });

        const createdEvent = await event.save();

        // Notify admins if it's an organizer creating an event
        if (req.user.role === 'organizer') {
            const admins = await User.find({ role: 'admin' });
            for (const admin of admins) {
                await createNotification(
                    admin._id,
                    'Event Approval Required',
                    `New event "${createdEvent.title}" requires your approval.`,
                    'system',
                    createdEvent._id
                );
            }
        }

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

            // Notify all attendees about cancellation
            const bookings = await Booking.find({ event: event._id });
            for (const booking of bookings) {
                await createNotification(
                    booking.user,
                    'Event Cancelled!',
                    `We regret to inform you that "${event.title}" has been cancelled.`,
                    'update',
                    null
                );
            }

            await event.deleteOne();
            res.json({ message: 'Event removed and attendees notified' });
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
        const events = await Event.find({ user: req.user._id }).sort({ date: 1 });
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

            const dateChanged = req.body.date && new Date(req.body.date).getTime() !== new Date(event.date).getTime();
            const venueChanged = req.body.venue && req.body.venue !== event.venue;
            const titleChanged = req.body.title && req.body.title.toLowerCase().trim() !== event.title.toLowerCase().trim();

            if (dateChanged || venueChanged || titleChanged) {
                const checkTitle = req.body.title || event.title;
                const checkVenue = req.body.venue || event.venue;
                const checkDate = req.body.date ? new Date(req.body.date) : event.date;

                const duplicate = await Event.findOne({
                    _id: { $ne: event._id },
                    title: { $regex: new RegExp(`^${checkTitle.trim()}$`, 'i') },
                    venue: { $regex: new RegExp(`^${checkVenue.trim()}$`, 'i') },
                    date: checkDate
                });

                if (duplicate) {
                    res.status(400);
                    throw new Error('Update conflict: Another event with this title and date is already listed at this venue.');
                }
            }

            event.title = req.body.title || event.title;
            event.description = req.body.description || event.description;
            event.category = req.body.category || event.category;
            event.date = req.body.date || event.date;
            event.venue = req.body.venue || event.venue;
            event.address = req.body.address || event.address;
            event.ticketPrice = req.body.ticketPrice ?? event.ticketPrice;
            event.capacity = req.body.capacity || event.capacity;
            event.image = req.body.image || event.image;
            event.gallery = req.body.gallery || event.gallery;
            event.isPaid = event.ticketPrice > 0;

            // Reset status to pending if updated by an organizer (require re-approval)
            // Admins can maintain approved status
            if (req.user.role !== 'admin') {
                event.status = 'pending';
            }

            const updatedEvent = await event.save();

            if (dateChanged || venueChanged) {
                const bookings = await Booking.find({ event: event._id });
                for (const booking of bookings) {
                    await createNotification(
                        booking.user,
                        'Event Updated!',
                        `"${event.title}" has been updated. New ${dateChanged ? 'Date: ' + new Date(event.date).toLocaleDateString() : ''} ${venueChanged ? 'Venue: ' + event.venue : ''}`,
                        'update',
                        event._id
                    );
                }
            }

            res.json(updatedEvent);
        } else {
            res.status(404);
            throw new Error('Event not found');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Approve event
// @route   PUT /api/events/:id/approve
// @access  Private/Admin
const approveEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            event.status = 'approved';
            const updatedEvent = await event.save();

            // Notify organizer
            await createNotification(
                event.user,
                'Event Approved!',
                `Your event "${event.title}" has been approved and is now live.`,
                'system',
                event._id
            );

            // Notify all regular users about new approved event
            const users = await User.find({ role: 'user' });
            for (const user of users) {
                await createNotification(
                    user._id,
                    'New Event Alert!',
                    `A new event "${event.title}" has been posted in ${event.category}. Check it out!`,
                    'reminder',
                    event._id
                );
            }

            res.json(updatedEvent);
        } else {
            res.status(404);
            throw new Error('Event not found');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Reject event
// @route   PUT /api/events/:id/reject
// @access  Private/Admin
const rejectEvent = async (req, res) => {
    try {
        const { reason } = req.body;
        const event = await Event.findById(req.params.id);

        if (event) {
            event.status = 'rejected';
            event.rejectionReason = reason;
            const updatedEvent = await event.save();

            // Notify organizer
            await createNotification(
                event.user,
                'Event Rejected',
                `Your event "${event.title}" was not approved. ${reason ? 'Reason: ' + reason : ''}`,
                'system',
                event._id
            );

            res.json(updatedEvent);
        } else {
            res.status(404);
            throw new Error('Event not found');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get pending events
// @route   GET /api/events/admin/pending
// @access  Private/Admin
const getPendingEvents = async (req, res) => {
    try {
        const events = await Event.find({ status: 'pending' }).populate('user', 'name email');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    deleteEvent,
    updateEvent,
    getOrganizerEvents,
    approveEvent,
    rejectEvent,
    getPendingEvents,
};

