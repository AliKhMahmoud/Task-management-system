const Notification = require('../models/Notification');
const { sendNotification } = require('../utils/socket');

class NotificationService {
    static async createAndSend(recipientId, type, data, title = null) {
        try {
            // Generate title if not provided
            if (!title) {
                title = this.generateTitle(type, data);
            }

            // Create notification in database
            const notification = await Notification.create({
                recipient: recipientId,
                type,
                title,
                message: data.message || title,
                data,
            });

            // Send real-time notification
            sendNotification(recipientId, type, {
                ...data,
                notificationId: notification._id,
                title,
                message: data.message || title,
            });

            return notification;
        } catch (error) {
            console.error('Failed to create and send notification:', error);
            throw error;
        }
    }

    static generateTitle(type, data) {
        const titles = {
            'NEW_TASK_ASSIGNED': 'New Task Assigned',
            'TASK_REASSIGNED': 'Task Reassigned',
            'TASK_STATUS_UPDATED': 'Task Status Updated',
            'IMPORTANT_NOTE_ADDED': 'Important Note Added',
            'TASK_DUE_SOON': 'Task Due Soon',
            'TASK_OVERDUE': 'Task Overdue'
        };

        return titles[type] || 'Notification';
    }

    static async getUnreadNotifications(userId, limit = 50) {
        return await Notification.find({ 
            recipient: userId, 
            read: false 
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    }

    static async getAllNotifications(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        
        const [notifications, total] = await Promise.all([
            Notification.find({ recipient: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Notification.countDocuments({ recipient: userId })
        ]);

        return {
            notifications,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
        };
    }

    static async markAsRead(notificationId, userId) {
        const notification = await Notification.findOneAndUpdate(
            { 
                _id: notificationId, 
                recipient: userId 
            },
            { 
                read: true, 
                readAt: new Date() 
            },
            { new: true }
        );

        return notification;
    }

    static async markAllAsRead(userId) {
        const result = await Notification.updateMany(
            { 
                recipient: userId, 
                read: false 
            },
            { 
                read: true, 
                readAt: new Date() 
            }
        );

        return result;
    }

    static async getUnreadCount(userId) {
        return await Notification.countDocuments({ 
            recipient: userId, 
            read: false 
        });
    }
}

module.exports = NotificationService;
