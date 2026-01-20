const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notifications.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(requireAuth);

// Get notifications (with pagination and filtering)
router.get('/', notificationController.getNotifications);

// Get unread notifications count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark specific notification as read
router.patch('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', notificationController.markAllAsRead);

module.exports = router;
