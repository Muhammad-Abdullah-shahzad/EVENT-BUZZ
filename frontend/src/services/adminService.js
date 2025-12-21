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

const adminService = {
    getStats,
    getUsers,
    deleteUser,
    updateUserRole,
};

export default adminService;
