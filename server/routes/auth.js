const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const ctrl = require('../controllers/authController');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', protect, ctrl.getMe);

// Settings & user management routes
router.patch('/change-password', protect, ctrl.changePassword);
router.patch('/profile', protect, ctrl.updateProfile);
router.get('/users', protect, restrictTo('superadmin', 'admin'), ctrl.getAllUsers);
router.post('/users', protect, restrictTo('superadmin', 'admin'), ctrl.createUser);
router.put('/users/:id', protect, restrictTo('superadmin', 'admin'), ctrl.updateUser);
router.delete('/users/:id', protect, restrictTo('superadmin'), ctrl.deleteUser);

module.exports = router;
