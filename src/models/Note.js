const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, 'Note content is required'],
            trim: true,
        },
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            required: [true, 'Task reference is required'],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Author reference is required'],
        },
        isImportant: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

noteSchema.index({ task: 1 });
noteSchema.index({ createdBy: 1 });
noteSchema.index({ createdAt: -1 });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;