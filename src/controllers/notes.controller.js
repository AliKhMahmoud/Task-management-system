const Note = require("../models/Note");
const Task = require("../models/Task");
const { USER_ROLES } = require("../utils/constants");

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
            match: { isActive: true } // فقط المستخدمين النشطين
        })
        .sort({ createdAt: -1 })
        .lean();

        return res.status(200).json({
            success: true,
            count: notes.length,
            data: notes
        });
    }

 
    // async createNote(req,res){
    //     const { content, task, isImportant } = req.body;

    //     const existingTask = await Task.findById(task).select("assignedTo");
    //     if (!existingTask) {
    //         res.status(404);
    //         throw new Error("Task not found");
    //     }

    //     if (req.user.role !== USER_ROLES.MANAGER) {
    //         if (String(existingTask.assignedTo) !== String(req.user.id)) {
    //             res.status(403);
    //             throw new Error("Not authorized to add note to this task");
    //         }
    //     }

    //     const note = await Note.create({
    //         content,
    //         task,
    //         isImportant: !!isImportant,
    //         createdBy: req.user.id
    //     });

    //     return res.status(201).json({
    //         success: true,
    //         message: "Note created successfully",
    //         data: note
    //     });
    // }
    
    async createNote(req, res) {
    const { content, task, isImportant } = req.body;

    const existingTask = await Task.findById(task)
        .select("title assignedTo");
    
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
    });

    const populatedNote = await Note.findById(note._id)
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
            select: "name email role avatar"
        })
        .lean();

   
    const formattedNote = {
        id: populatedNote._id,
        content: populatedNote.content,
        isImportant: populatedNote.isImportant,
        task: populatedNote.task ? {
            id: populatedNote.task._id,
            title: populatedNote.task.title,  
            status: populatedNote.task.status,
            dueDate: populatedNote.task.dueDate,
            assignedTo: populatedNote.task.assignedTo ? {
                id: populatedNote.task.assignedTo._id,
                name: populatedNote.task.assignedTo.name,
                email: populatedNote.task.assignedTo.email
            } : null
        } : null,
        createdBy: populatedNote.createdBy ? {
            id: populatedNote.createdBy._id,
            name: populatedNote.createdBy.name, 
            email: populatedNote.createdBy.email,
            role: populatedNote.createdBy.role,
            avatar: populatedNote.createdBy.avatar
        } : {
            id: null,
            name: "Unknown User",
            email: null,
            role: null,
            avatar: null
        },
        createdAt: populatedNote.createdAt,
        updatedAt: populatedNote.updatedAt
    };

    return res.status(201).json({
        success: true,
        message: "Note created successfully",
        data: formattedNote 
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
    // async updateNote(req,res){
    //     const note = await Note.findById(req.params.id);
    //     if (!note) {
    //         res.status(404);
    //         throw new Error("Note not found");
    //     }

    //     if (req.user.role !== USER_ROLES.MANAGER) {
    //         if (String(note.createdBy) !== String(req.user.id)) {
    //             res.status(403);
    //             throw new Error("Not authorized to update this note");
    //         }
    //     }

    //     const { content, isImportant } = req.body;
    //     if (typeof content !== "undefined") note.content = content;
    //     if (typeof isImportant !== "undefined") note.isImportant = !!isImportant;

    //     await note.save();

    //     return res.status(200).json({
    //         success: true,
    //         message: "Note updated successfully",
    //         data: note
    //     });
    // }
    async updateNote(req, res) {
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

    const updatedNote = await Note.findById(note._id)
        .populate({
            path: "task",
            select: "title status dueDate assignedTo",
            populate: {
                path: "assignedTo",
                select: "name email"
            }
        })
        .populate({
            path: "createdBy",
            select: "name email role avatar"
        })
        .lean();

    const responseData = {
        ...updatedNote,
        id: updatedNote._id,
        task: updatedNote.task ? {
            ...updatedNote.task,
            id: updatedNote.task._id,
            assignedTo: updatedNote.task.assignedTo ? {
                ...updatedNote.task.assignedTo,
                id: updatedNote.task.assignedTo._id
            } : null
        } : null,
        createdBy: updatedNote.createdBy ? {
            ...updatedNote.createdBy,
            id: updatedNote.createdBy._id
        } : {
            id: null,
            name: "Unknown User",
            email: null,
            role: null,
            avatar: null
        }
    };
    
   
    delete responseData._id;
    delete responseData.__v;
    if (responseData.task) delete responseData.task._id;
    if (responseData.task?.assignedTo) delete responseData.task.assignedTo._id;
    if (responseData.createdBy) delete responseData.createdBy._id;

    return res.status(200).json({
        success: true,
        message: "Note updated successfully",
        data: responseData
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

        await note.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Note deleted successfully"
        });
    }




}

module.exports = new NoteController();
