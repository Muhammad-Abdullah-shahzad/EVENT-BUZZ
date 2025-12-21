const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        default: 'Credit Card (Mock)'
    },
    paymentId: {
        type: String, // Stripe Payment Intent ID or Mock ID
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Completed'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
