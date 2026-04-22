import api from './api';

const createBooking = async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
};

const getMyBookings = async () => {
    const response = await api.get('/bookings');
    return response.data;
};

const cancelBooking = async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
};

const getPublicTicket = async (id) => {
    const response = await api.get(`/bookings/public/${id}`);
    return response.data;
};

const bookingService = {
    createBooking,
    getMyBookings,
    cancelBooking,
    getPublicTicket
};

export default bookingService;
