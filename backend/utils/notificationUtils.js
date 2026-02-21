const Notification = require('../models/Notification');

const createNotification = async (userId, title, message, type = 'reminder', relatedEventId = null) => {
    try {
        await Notification.create({
            user: userId,
            title,
            message,
            type,
            relatedEvent: relatedEventId
        });
    } catch (error) {
        console.error('Error creating notification:', error.message);
    }
};

module.exports = { createNotification };
