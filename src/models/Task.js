const mongoose = require('mongoose');
const { TASK_STATUS, TASK_PRIORITY } = require('../utils/constants');

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'Project reference is required'],
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Assigned user is required'],
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Assigner user is required'],
        },
        dueDate: {
            type: Date,
            required: [true, 'Due date is required'],
        },
        priority: {
            type: String,
            enum: Object.values(TASK_PRIORITY),
            default: TASK_PRIORITY.MEDIUM,
        },
        status: {
            type: String,
            enum: Object.values(TASK_STATUS),
            default: TASK_STATUS.PENDING,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


taskSchema.index({ project: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });


taskSchema.virtual('notes', {
    ref: 'Note',
    localField: '_id',
    foreignField: 'task',
});


taskSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        if (this.status === TASK_STATUS.COMPLETED && !this.completedAt) {
            this.completedAt = new Date();
        } else if (this.status !== TASK_STATUS.COMPLETED) {
            this.completedAt = null;
        }
    }
    next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
