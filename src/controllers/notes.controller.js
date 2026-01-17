const Note = require("../models/Note");
const Task = require("../models/Task");
const Project = require("../models/Project");
const { USER_ROLES } = require("../utils/constants");
const { sendNotification } = require("../utils/socket");
const NotificationService = require("../services/notification.service");

class NoteController {

   async getAllNotes(req,res){
        const { role, id } = req.user;
        const filter = {};

        if (req.query.task) {
            filter.task = req.query.task;
        }

        if (role === USER_ROLES.MANAGER) {
            // Manager can view all notes or filter by task
        } else {
            // Team Member can only view notes for tasks assigned to them
            if (!filter.task) {
                const tasks = await Task.find({ assignedTo: id }).select("_id");
                const taskIds = tasks.map(t => t._id);
                filter.task = { $in: taskIds };
            } else {
                const task = await Task.findById(filter.task).select("assignedTo");
                if (!task || String(task.assignedTo) !== String(id)) {
                    res.status(403);
                    throw new Error("Not authorized to view notes for this task");
                }
            }
        }

       const notes = await Note.find(filter)
        .populate({
            path: "task",
            select: "title status dueDate",
            populate: {
                path: "assignedTo",
                select: "name email"
            }
        })
        .populate({
            path: "createdBy",
            select: "name email role",
            match: { isActive: true } 
        })
        .sort({ createdAt: -1 })
        .lean();

        return res.status(200).json({
            success: true,
            count: notes.length,
            data: notes
        });
    }

 

    async createNote(req,res){
        const { content, task, isImportant } = req.body;

        const existingTask = await Task.findById(task).populate("project", "name").select("assignedTo project title");
        if (!existingTask) {
            res.status(404);
            throw new Error("Task not found");
        }

        if (req.user.role !== USER_ROLES.MANAGER) {
            if (String(existingTask.assignedTo) !== String(req.user.id)) {
                res.status(403);
                throw new Error("Not authorized to add note to this task");
            }
        }

        const note = await Note.create({
            content,
            task,
            isImportant: !!isImportant,
            createdBy: req.user.id
        }).then(createdNote => 
    createdNote.populate({
        path: "createdBy",
        select: "name email role avatar"
    }));

        // Activity Log
        res.logActivity({
        action: "NOTE_CREATE",
        entityType: "Note",
        entityId: note._id,
        metadata: {
            taskId: note.task,
            isImportant: note.isImportant
        }
        });

        // Notify Manager if Note is Important
        if (note.isImportant) {
            const project = await Project.findById(existingTask.project._id).select('manager');
            if (project && project.manager) {
                await NotificationService.createAndSend(project.manager, "IMPORTANT_NOTE_ADDED", {
                    message: `Important note added to task: ${existingTask.title}`,
                    taskId: existingTask._id,
                    taskTitle: existingTask.title,
                    noteContent: content,
                    addedBy: req.user.name || req.user.username
                });
            }
        }

        return res.status(201).json({
            success: true,
            message: "Note created successfully",
            data: note
        });
    }
    
    async getNoteById(req,res){
        const note = await Note.findById(req.params.id)
            .populate("createdBy", "name email role");

        if (!note) {
            res.status(404);
            throw new Error("Note not found");
        }

        if (req.user.role !== USER_ROLES.MANAGER) {
            const task = await Task.findById(note.task).select("assignedTo");
            if (!task || String(task.assignedTo) !== String(req.user.id)) {
                res.status(403);
                throw new Error("Not authorized to view this note");
            }
        }

        return res.status(200).json({
            success: true,
            data: note
        });
    }
    async updateNote(req,res){
        const note = await Note.findById(req.params.id);
        if (!note) {
            res.status(404);
            throw new Error("Note not found");
        }

        if (req.user.role !== USER_ROLES.MANAGER) {
            if (String(note.createdBy) !== String(req.user.id)) {
                res.status(403);
                throw new Error("Not authorized to update this note");
            }
        }

        const { content, isImportant } = req.body;
        if (typeof content !== "undefined") note.content = content;
        if (typeof isImportant !== "undefined") note.isImportant = !!isImportant;

        await note.save();

        const changedFields = [];
        if (typeof content !== "undefined") changedFields.push("content");
        if (typeof isImportant !== "undefined") changedFields.push("isImportant");

        await note.save();
        await note.populate({
        path: "createdBy",
        select: "name email role avatar"
    });
        // Activity Log
        res.logActivity({
        action: "NOTE_UPDATE",
        entityType: "Note",
        entityId: note._id,
        metadata: {
            changedFields,
            taskId: note.task
        }
        });

        return res.status(200).json({
            success: true,
            message: "Note updated successfully",
            data: note
        });
    }
    async deleteNote(req,res){
        const note = await Note.findById(req.params.id);
        if (!note) {
            res.status(404);
            throw new Error("Note not found");
        }

        if (req.user.role !== USER_ROLES.MANAGER) {
            if (String(note.createdBy) !== String(req.user.id)) {
                res.status(403);
                throw new Error("Not authorized to delete this note");
            }
        }


        // Activity Log
        const taskId = note.task;
        await note.deleteOne();

        res.logActivity({
        action: "NOTE_DELETE",
        entityType: "Note",
        entityId: req.params.id,
        metadata: { taskId }
        });

        return res.status(200).json({
            success: true,
            message: "Note deleted successfully"
        });
    }




}

module.exports = new NoteController();
