const express = require('express');
const router = express.Router();
const { getStats, getUsers, deleteUser, updateUserRole, addAdmin } = require('../controllers/adminController');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getStats);
router.route('/users')
    .get(protect, admin, getUsers);

router.post('/users/admin', protect, superAdmin, addAdmin);

router.route('/users/:id')
    .delete(protect, admin, deleteUser);

router.route('/users/:id/role')
    .put(protect, admin, updateUserRole);

module.exports = router;
