const mongoose = require('mongoose');
const Event = require('./backend/models/Event');
require('dotenv').config({ path: './backend/.env' });

async function run() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventbuzz');
    const allEvents = await Event.find({});
    console.log(JSON.stringify(allEvents, null, 2));
    process.exit(0);
}
run();
