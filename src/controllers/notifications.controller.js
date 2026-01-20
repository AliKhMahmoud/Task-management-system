const NotificationService = require('../services/notification.service');

class NotificationController {
    async getNotifications(req, res) {
        try {
            const { page = 1, limit = 20, unreadOnly = false } = req.query;
            const userId = req.user.id;

            let result;
            if (unreadOnly === 'true') {
                const notifications = await NotificationService.getUnreadNotifications(
                    userId, 
                    parseInt(limit)
                );
                result = {
                    notifications,
                    total: notifications.length,
                    unreadCount: notifications.length
                };
            } else {
                result = await NotificationService.getAllNotifications(
                    userId, 
                    parseInt(page), 
                    parseInt(limit)
                );
            }

            res.status(200).json({
                success: true,
                message: "Notifications retrieved successfully",
                ...result
            });
        } catch (error) {
            res.status(500);
            throw error;
        }
    }

    async markAsRead(req, res) {
        try {
            const { notificationId } = req.params;
            const userId = req.user.id;

            const notification = await NotificationService.markAsRead(notificationId, userId);

            if (!notification) {
                res.status(404);
                throw new Error("Notification not found or you're not authorized");
            }

            res.status(200).json({
                success: true,
                message: "Notification marked as read",
                data: notification
            });
        } catch (error) {
            res.status(error.statusCode || 500);
            throw error;
        }
    }

    async markAllAsRead(req, res) {
        try {
            const userId = req.user.id;
            const result = await NotificationService.markAllAsRead(userId);

            res.status(200).json({
                success: true,
                message: "All notifications marked as read",
                modifiedCount: result.modifiedCount
            });
        } catch (error) {
            res.status(500);
            throw error;
        }
    }

    async getUnreadCount(req, res) {
        try {
            const userId = req.user.id;
            const count = await NotificationService.getUnreadCount(userId);

            res.status(200).json({
                success: true,
                unreadCount: count
            });
        } catch (error) {
            res.status(500);
            throw error;
        }
    }
}

module.exports = new NotificationController();
