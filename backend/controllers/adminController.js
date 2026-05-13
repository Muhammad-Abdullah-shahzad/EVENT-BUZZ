const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const usersCount = await User.countDocuments();
        const eventsCount = await Event.countDocuments({ status: 'approved' }); // Only approved events are "live"
        const pendingEventsCount = await Event.countDocuments({ status: 'pending' });
        const bookingsCount = await Booking.countDocuments();

        // Calculate total revenue from completed payments only
        const completedBookings = await Booking.find({ paymentStatus: 'Completed' });
        const totalRevenue = completedBookings.reduce((acc, booking) => acc + (booking.totalAmount || 0), 0);

        res.json({
            users: usersCount,
            events: eventsCount,
            pendingEvents: pendingEventsCount,
            bookings: bookingsCount,
            revenue: totalRevenue
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'superadmin') {
            return res.status(403).json({ message: 'Cannot delete super admin user' });
        }

        if (user.role === 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Only super admin can delete admin users' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User removed successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ message: 'Failed to delete user: ' + error.message });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newRole = req.body.role;

        // Only super admin can assign admin or superadmin roles
        if ((newRole === 'admin' || newRole === 'superadmin') && req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Only super admin can assign admin or super admin roles' });
        }

        user.role = newRole || user.role;
        user.isAdmin = user.role === 'admin' || user.role === 'superadmin';
        const updatedUser = await user.save();
        
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
        });
    } catch (error) {
        console.error('Update Role Error:', error);
        res.status(500).json({ message: 'Failed to update user role: ' + error.message });
    }
};

module.exports = {
    getStats,
    getUsers,
    deleteUser,
    updateUserRole
};
