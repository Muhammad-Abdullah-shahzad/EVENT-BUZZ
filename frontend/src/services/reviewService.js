import api from './api';

const createReview = async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
};

const getEventReviews = async (eventId) => {
    const response = await api.get(`/reviews/${eventId}`);
    return response.data;
};

const reviewService = {
    createReview,
    getEventReviews,
};

export default reviewService;
