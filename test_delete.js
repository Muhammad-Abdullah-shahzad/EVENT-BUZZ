const mongoose = require('mongoose');
const User = require('./backend/models/User');

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/eventbuzz');
    console.log("Connected to DB");
    
    // Find an admin user
    const admin = await User.findOne({ role: 'admin' });
    console.log("Admin:", admin ? admin.email : "Not found");
    
    // Create a dummy user
    const dummy = await User.create({
        name: "Dummy user",
        email: "dummy@example.com",
        password: "password123",
        role: "user"
    });
    console.log("Dummy created:", dummy._id);
    
    // Attempt delete like in controller
    const user = await User.findById(dummy._id);
    if(user) {
        try {
            await user.deleteOne();
            console.log("Deleted successfully! (using user.deleteOne())");
        } catch (e) {
            console.error("Error using user.deleteOne():", e);
        }
    }
    
    process.exit(0);
}
run();
