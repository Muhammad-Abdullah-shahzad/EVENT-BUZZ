const Booking = require('../models/Booking');
const Event = require('../models/Event');
const QRCode = require('qrcode');
const { createNotification } = require('../utils/notificationUtils');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    const { eventId, tickets } = req.body;

    try {
        const event = await Event.findById(eventId);

        if (!event) {
            res.status(404);
            throw new Error('Event not found');
        }

        if (event.ticketsSold + Number(tickets) > event.capacity) {
            res.status(400);
            throw new Error('Not enough tickets available');
        }

        const totalAmount = event.ticketPrice * Number(tickets);

        // If event is free, complete immediately. If paid, set to Pending.
        // Frontend should check status and query payment API if needed.
        const paymentStatus = !event.isPaid ? 'Completed' : 'Pending';

        const booking = new Booking({
            user: req.user._id,
            event: eventId,
            tickets: Number(tickets),
            totalAmount,
            paymentStatus
        });

        console.log('Creating booking for event:', eventId);
        const createdBooking = await booking.save();
        console.log('Booking saved:', createdBooking._id);

        const qrData = JSON.stringify({
            bookingId: createdBooking._id,
            user: req.user.name,
            event: event.title,
            tickets: tickets,
            status: paymentStatus
        });

        const qrCode = await QRCode.toDataURL(qrData);
        createdBooking.qrCode = qrCode;
        await createdBooking.save();
        console.log('QR Code generated and booking updated');

        // Increment ticketsSold ONLY for free events
        if (!event.isPaid) {
            event.ticketsSold += Number(tickets);
            await event.save();
        }

        // Create notification for booking success (Attendee)
        await createNotification(
            req.user._id,
            'Booking Confirmed!',
            `You have successfully booked ${tickets} ticket(s) for ${event.title}.`,
            'booking',
            event._id
        );

        // Notify Organizer
        await createNotification(
            event.user, // Event owner
            'New Ticket Booking!',
            `${req.user.name} just booked ${tickets} ticket(s) for your event: ${event.title}`,
            'booking',
            event._id
        );

        res.status(201).json(createdBooking);
    } catch (error) {
        console.error('Create Booking Error:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings
// @access  Private
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('event', 'title date venue image')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    getMyBookings
};
