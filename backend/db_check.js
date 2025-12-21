const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');
const User = require('./models/User');

dotenv.config({ path: './.env' });

const checkEvents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const events = await Event.find({}).populate('user', 'name role');
        console.log(`Found ${events.length} events total.`);

        events.forEach(e => {
            console.log(`Event: ${e.title}, Organizer: ${e.user?.name}, UserID: ${e.user?._id}`);
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

checkEvents();
