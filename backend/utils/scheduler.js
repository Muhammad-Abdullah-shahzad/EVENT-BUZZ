const cron = require('node-cron');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { createNotification } = require('./notificationUtils');

const initScheduler = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        console.log('Running reminder check...');
        try {
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

            // 1. Find events happening in the next 24-25 hours (24hr Reminder)
            const dailyEvents = await Event.find({
                date: {
                    $gte: tomorrow,
                    $lt: new Date(tomorrow.getTime() + 60 * 60 * 1000)
                }
            });

            for (const event of dailyEvents) {
                const bookings = await Booking.find({ event: event._id });
                for (const booking of bookings) {
                    await createNotification(
                        booking.user,
                        'Event Reminder (24h)!',
                        `"${event.title}" is happening tomorrow at ${event.venue}.`,
                        'reminder',
                        event._id
                    );
                }
            }

            // 2. Find events happening in the next 1-2 hours (1hr Reminder)
            const imminentEvents = await Event.find({
                date: {
                    $gte: inOneHour,
                    $lt: new Date(inOneHour.getTime() + 60 * 60 * 1000)
                }
            });

            for (const event of imminentEvents) {
                const bookings = await Booking.find({ event: event._id });
                for (const booking of bookings) {
                    await createNotification(
                        booking.user,
                        'Event Final Call (1h)!',
                        `"${event.title}" starts in 1 hour! See you at ${event.venue}.`,
                        'reminder',
                        event._id
                    );
                }
            }
        } catch (error) {
            console.error('Scheduler Error:', error.message);
        }
    });
};

module.exports = { initScheduler };
