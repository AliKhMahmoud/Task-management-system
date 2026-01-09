const Task = require("../models/Task");
const Project = require("../models/Project");
const { USER_ROLES } = require("../utils/constants");

class TaskController {

    getAllTask = async (req, res) => {
        const { role, id } = req.user;
        let filter = {};

        // Filtering
        if (req.query.status) filter.status = req.query.status;
        if (req.query.priority) filter.priority = req.query.priority;
        if (req.query.project) filter.project = req.query.project;

        if (role === USER_ROLES.MANAGER) {
            // Manager can filter by assignedTo if provided
            if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
        } else {
            // Team Member sees only their tasks
            filter.assignedTo = id;
        }

        const tasks = await Task.find(filter)
            .populate("project", "name")
            .populate("assignedTo", "username email")
            .populate("assignedBy", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    }
    
    findTaskById = async (req, res) => {
        const task = await Task.findById(req.params.id)
            .populate("project", "name")
            .populate("assignedTo", "username email")
            .populate("assignedBy", "username email")
            .populate("notes");

        if (!task) {
            res.status(404);
            throw new Error("Task not found");
        }

        // Authorization check for Team Member
        if (req.user.role !== USER_ROLES.MANAGER) {
            const userId = req.user.id.toString();
            const isAssignedTo = task.assignedTo && task.assignedTo._id.toString() === userId;
            const isAssignedBy = task.assignedBy && task.assignedBy._id.toString() === userId;

            if (!isAssignedTo && !isAssignedBy) {
                res.status(403);
                throw new Error("Not authorized to view this task");
            }
        }

        res.status(200).json({
            success: true,
            data: task
        });
    }

    addTaskByManager = async (req, res) => {
        const { title, description, project, assignedTo, dueDate, priority, status } = req.body;

        // Verify Project exists
        const projectExists = await Project.findById(project);
        if (!projectExists) {
            res.status(404);
            throw new Error("Project not found");
        }

        const task = await Task.create({
            title,
            description,
            project,
            assignedTo,
            assignedBy: req.user.id,
            dueDate,
            priority,
            status
        });

        // Activity Log
        res.logActivity({
        action: "TASK_CREATE",
        entityType: "Task",
        entityId: task._id,
        metadata: {
            projectId: task.project,
            assignedTo: task.assignedTo,
            dueDate: task.dueDate,
            priority: task.priority,
            status: task.status
        }
        });


        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: task
        });
    }

    updateTaskByManager = async (req, res) => {
        let task = await Task.findById(req.params.id);

        if (!task) {
            res.status(404);
            throw new Error("Task not found");
        }

        const { role, id } = req.user;

        if (role === USER_ROLES.MANAGER) {
            // Manager can update everything
            task = await Task.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            });

            // Activity Log
            res.logActivity({
            action: "TASK_UPDATE",
            entityType: "Task",
            entityId: task._id,
            metadata: {
                byRole: role,
                changedFields: Object.keys(req.body || {})
            }
            });

        } else {
            // Team Member can only update status
            const userId = id.toString();
            const isAssignedTo = task.assignedTo.toString() === userId;
            const isAssignedBy = task.assignedBy.toString() === userId;

            if (!isAssignedTo && !isAssignedBy) {
                res.status(403);
                throw new Error("Not authorized to update this task");
            }

            if (req.body.status) {
                task.status = req.body.status;
                await task.save();

                // Activity Log
                res.logActivity({
                action: "TASK_STATUS_UPDATE",
                entityType: "Task",
                entityId: task._id,
                metadata: { status: task.status }
                });

            }
        }

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: task
        });
    }
    
    removeTaskByManager = async (req, res) => {
        const task = await Task.findById(req.params.id);

        if (!task) {
            res.status(404);
            throw new Error("Task not found");
        }

        await task.deleteOne();

        // Activity Log
        res.logActivity({
        action: "TASK_DELETE",
        entityType: "Task",
        entityId: req.params.id,
        metadata: { projectId: task.project, assignedTo: task.assignedTo }
        });


        res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });
    }

}

module.exports = new TaskController();
