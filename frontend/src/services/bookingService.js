import api from './api';

const createBooking = async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
};

const getMyBookings = async () => {
    const response = await api.get('/bookings');
    return response.data;
};

const bookingService = {
    createBooking,
    getMyBookings,
};

export default bookingService;
