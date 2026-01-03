const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Project name is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
            validate: {
                validator: function (value) {
                    return value > this.startDate;
                },
                message: 'End date must be after start date',
            },
        },
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Manager is required'],
        },
        members: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        status: {
            type: String,
            enum: ['active', 'completed', 'cancelled', 'on_hold'],
            default: 'active',
        },
        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true }, 
        toObject: { virtuals: true }
    }
);

// فهرس للبحث السريع
projectSchema.index({ manager: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ startDate: 1, endDate: 1 });
projectSchema.index({ members: 1 });

// Virtual لحساب عدد المهام
projectSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'project',
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;