import axios from 'axios';
import api from './api';

const getAllEvents = async (keywordOrFilters = '', filters = {}) => {
    let keyword = '';
    let finalFilters = filters;

    if (typeof keywordOrFilters === 'object' && keywordOrFilters !== null) {
        keyword = keywordOrFilters.keyword || '';
        finalFilters = keywordOrFilters;
    } else {
        keyword = keywordOrFilters;
    }

    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (finalFilters.category && finalFilters.category !== 'All') params.append('category', finalFilters.category);
    if (finalFilters.date) params.append('date', finalFilters.date);
    if (finalFilters.minPrice) params.append('minPrice', finalFilters.minPrice);
    if (finalFilters.maxPrice) params.append('maxPrice', finalFilters.maxPrice);
    if (finalFilters.lat) params.append('lat', finalFilters.lat);
    if (finalFilters.lng) params.append('lng', finalFilters.lng);
    if (finalFilters.distance) params.append('distance', finalFilters.distance);

    const response = await api.get(`/events?${params.toString()}`);
    return response.data;
};

const getEventById = async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
};

const createEvent = async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
};

const deleteEvent = async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
};

const updateEvent = async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
};

const getOrganizerEvents = async () => {
    const response = await api.get('/events/organizer/my-events');
    return response.data;
};

const uploadImage = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary credentials missing in .env');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
    );
    return response.data.secure_url;
};

const eventService = {
    getAllEvents,
    getEvents: getAllEvents, // Alias for convenience
    getEventById,
    createEvent,
    deleteEvent,
    updateEvent,
    getOrganizerEvents,
    uploadImage,
};

export default eventService;
