const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Recipient is required'],
        },
        type: {
            type: String,
            required: [true, 'Notification type is required'],
            enum: [
                'NEW_TASK_ASSIGNED',
                'TASK_REASSIGNED', 
                'TASK_STATUS_UPDATED',
                'IMPORTANT_NOTE_ADDED',
                'TASK_DUE_SOON',
                'TASK_OVERDUE'
            ]
        },
        title: {
            type: String,
            required: [true, 'Notification title is required'],
            trim: true,
        },
        message: {
            type: String,
            required: [true, 'Notification message is required'],
            trim: true,
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        read: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
            default: null,
        }
    },
    {
        timestamps: true,
    }
);

// Indexes for better performance
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
