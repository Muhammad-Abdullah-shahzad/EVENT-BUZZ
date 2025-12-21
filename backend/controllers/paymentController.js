const Event = require('../models/Event');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const crypto = require('crypto');
const querystring = require('querystring');

// Helper to generate PayFast signature
const generateSignature = (data, passPhrase = null) => {
    // Create parameter string
    let pfOutput = "";
    for (let key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            if (data[key] !== "") {
                pfOutput += `${key}=${urlencode(data[key])}&`;
            }
        }
    }

    // Remove last ampersand
    let getString = pfOutput.slice(0, -1);
    if (passPhrase !== null && passPhrase !== "") {
        getString += `&passphrase=${urlencode(passPhrase)}`;
    }

    return crypto.createHash('md5').update(getString).digest('hex');
};

const urlencode = (str) => {
    return encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
        .replace(/%20/g, '+');
};

// @desc    Create PayFast (SA) Payment Request Payload
// @route   POST /api/payments/create-session
// @access  Private
const createCheckoutSession = async (req, res) => {
    const { bookingId } = req.body;

    try {
        const booking = await Booking.findById(bookingId).populate('event').populate('user');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const merchantId = process.env.PAYFAST_MERCHANT_ID;
        const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
        const passphrase = process.env.PAYFAST_PASSPHRASE;

        const amount = booking.totalAmount.toFixed(2);
        const orderId = booking._id.toString();

        // PayFast (SA) Fields
        const postData = {
            merchant_id: merchantId,
            merchant_key: merchantKey,
            return_url: `${process.env.CLIENT_URL}/payment/success?booking_id=${orderId}`,
            cancel_url: `${process.env.CLIENT_URL}/payment/cancel?booking_id=${orderId}`,
            notify_url: process.env.PAYFAST_CALLBACK_URL,
            name_first: booking.user.name.split(' ')[0] || 'Customer',
            name_last: booking.user.name.split(' ')[1] || 'Name',
            email_address: booking.user.email,
            m_payment_id: orderId,
            amount: amount,
            item_name: `Booking for ${booking.event.title}`
        };

        // Generate Signature
        postData.signature = generateSignature(postData, passphrase);

        res.json({
            paymentUrl: process.env.PAYFAST_URL,
            postData: postData
        });

    } catch (error) {
        console.error('PayFast Request Error:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Handle PayFast ITN (Instant Transaction Notification)
// @route   POST /api/payments/payfast-callback
// @access  Public
const handlePayFastCallback = async (req, res) => {
    const pfData = req.body;
    console.log('PayFast ITN Received:', pfData);

    try {
        // 1. Validate signature (highly recommended in production)
        // 2. Check if payment was successful
        if (pfData.payment_status === 'COMPLETE') {
            const bookingId = pfData.m_payment_id;
            const booking = await Booking.findById(bookingId).populate('user');

            if (booking && booking.paymentStatus !== 'Completed') {
                booking.paymentStatus = 'Completed';
                booking.paymentId = pfData.pf_payment_id;
                await booking.save();

                await Payment.create({
                    booking: bookingId,
                    user: booking.user._id,
                    amount: pfData.amount_gross,
                    paymentMethod: 'PayFast',
                    paymentId: pfData.pf_payment_id,
                    status: 'Completed'
                });

                const event = await Event.findById(booking.event);
                if (event) {
                    event.ticketsSold += booking.tickets;
                    await event.save();
                }
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('PayFast Callback Error:', error);
        res.status(500).send('Error processing ITN');
    }
};

// @desc    Verify PayFast Payment (Used by SuccessPage for local dev)
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
    const { bookingId } = req.body;

    try {
        const booking = await Booking.findById(bookingId).populate('user');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // For local development, if we reach the success page, we assume payment was okay
        // In production, the ITN (handlePayFastCallback) is the source of truth
        if (booking.paymentStatus !== 'Completed') {
            booking.paymentStatus = 'Completed';
            booking.paymentId = `LOCAL_DEV_${Date.now()}`;
            await booking.save();

            // Create payment record
            await Payment.create({
                booking: bookingId,
                user: booking.user._id,
                amount: booking.totalAmount,
                paymentMethod: 'PayFast (Local)',
                paymentId: booking.paymentId,
                status: 'Completed'
            });

            // Update event ticketsSold
            const event = await Event.findById(booking.event);
            if (event) {
                event.ticketsSold += booking.tickets;
                await event.save();
            }

            res.json({ success: true, message: 'Local verification successful, revenue updated' });
        } else {
            res.json({ success: true, message: 'Payment already processed' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createCheckoutSession,
    handlePayFastCallback,
    verifyPayment
};
