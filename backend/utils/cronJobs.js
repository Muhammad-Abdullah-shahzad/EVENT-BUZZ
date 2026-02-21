const cron = require('node-cron');
const Event = require('../models/Event');

const initCronJobs = () => {
    // Run every hour to archive past events
    cron.schedule('0 * * * *', async () => {
        console.log('Running Auto-Archive Task...');
        try {
            const now = new Date();
            // Find all approved events where the date is in the past and they are not yet archived
            const result = await Event.updateMany(
                {
                    status: 'approved',
                    date: { $lt: now }
                },
                {
                    $set: { status: 'archived' }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`Auto-Archived ${result.modifiedCount} past events.`);
            }
        } catch (error) {
            console.error('Error in Auto-Archive Cron Job:', error);
        }
    });

    console.log('Cron Jobs Initialized.');
};

module.exports = { initCronJobs };
