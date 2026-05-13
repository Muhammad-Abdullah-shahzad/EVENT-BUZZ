const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const superAdminExists = await User.findOne({ role: 'superadmin' });

        if (superAdminExists) {
            console.log('Super admin already exists');
            process.exit(0);
        }

        const superAdmin = await User.create({
            name: 'System Super Admin',
            email: 'superadmin@eventbuzz.com',
            password: 'SuperAdminPassword123', // User should change this after first login
            role: 'superadmin',
            isAdmin: true
        });

        if (superAdmin) {
            console.log('Super admin created successfully!');
            console.log('Email: superadmin@eventbuzz.com');
            console.log('Password: SuperAdminPassword123');
        }

        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedSuperAdmin();
