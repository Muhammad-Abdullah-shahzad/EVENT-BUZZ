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
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentUrl;

    for (const key in postData) {
        if (Object.prototype.hasOwnProperty.call(postData, key)) {
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = key;
            hiddenField.value = postData[key];
            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
};

const paymentService = {
    createCheckoutSession,
    verifyPayment,
    processPayFastPayment,
    processPayment: createCheckoutSession
};

export default paymentService;
