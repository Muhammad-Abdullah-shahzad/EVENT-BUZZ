import api from './api';

const createCheckoutSession = async (bookingId) => {
    const response = await api.post('/payments/create-session', { bookingId });
    return response.data; // Now returns { paymentUrl, postData }
};

const verifyPayment = async (sessionId, bookingId) => {
    // For PayFast, verification is normally handled by the callback,
    // but we use this manually for local development.
    const response = await api.post('/payments/verify', { sessionId, bookingId });
    return response.data;
};

const processPayFastPayment = (paymentUrl, postData) => {
    // Navigate to fake stripe sandbox or real stripe based on paymentUrl
    if (paymentUrl) {
        window.location.href = paymentUrl;
    }
};

const paymentService = {
    createCheckoutSession,
    verifyPayment,
    processPayFastPayment,
    processPayment: createCheckoutSession
};

export default paymentService;
