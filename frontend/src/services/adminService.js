import api from './api';

const getStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

const getUsers = async () => {
    const response = await api.get('/admin/users');
    return response.data;
};

const deleteUser = async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
};

const updateUserRole = async (id, role) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
};

const getPendingEvents = async () => {
    const response = await api.get('/events/admin/pending');
    return response.data;
};

const approveEvent = async (id) => {
    const response = await api.put(`/events/${id}/approve`);
    return response.data;
};

const rejectEvent = async (id, reason) => {
    const response = await api.put(`/events/${id}/reject`, { reason });
    return response.data;
};

const adminService = {
    getStats,
    getUsers,
    deleteUser,
    updateUserRole,
    getPendingEvents,
    approveEvent,
    rejectEvent,
};

export default adminService;
