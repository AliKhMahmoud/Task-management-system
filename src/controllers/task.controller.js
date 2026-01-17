const Task = require("../models/Task");
const Project = require("../models/Project");
const { USER_ROLES } = require("../utils/constants");
const User = require("../models/User");
const Note = require("../models/Note");
const { sendNotification } = require("../utils/socket");
const NotificationService = require("../services/notification.service");
class TaskController {


    getAllTask = async (req, res) => {
    const { role, id } = req.user;
    let filter = {};
    
    // === Basic Filtering ===
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.project) filter.project = req.query.project;
    
    // === Date Filtering ===
    if (req.query.dueDateFrom) {
        filter.dueDate = { ...filter.dueDate, $gte: new Date(req.query.dueDateFrom) };
    }
    if (req.query.dueDateTo) {
        const dateTo = new Date(req.query.dueDateTo);
        if (req.query.dueDateTo.length === 10) {
            dateTo.setHours(23, 59, 59, 999);
        }
        filter.dueDate = { ...filter.dueDate, $lte: dateTo };
    }
    
    // === Role-Based Filtering ===
    if (role === USER_ROLES.MANAGER) {
        if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    } else {
        filter.assignedTo = id;
    }
    
    // === Advanced Filtering ===
    if (req.query.search) {
        filter.$or = [
            { title: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } },
            { tags: { $regex: req.query.search, $options: 'i' } }
        ];
    }
    
    // === Pagination ===
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // === Sorting ===
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
        const validSortFields = ['dueDate', 'priority', 'createdAt', 'updatedAt', 'title'];
        if (validSortFields.includes(req.query.sortBy)) {
            const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
            sort = { [req.query.sortBy]: sortOrder };
        }
    }
    
    // === Query Execution ===
    const [tasks, total] = await Promise.all([
        Task.find(filter)
            .populate("project", "name description status")
            .populate("assignedTo", "username email name avatar")
            .populate("assignedBy", "username email name")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Task.countDocuments(filter)
    ]);
    

    // === Prepare Filter Info ===
    const appliedFilters = {};
    if (req.query.status) appliedFilters.status = req.query.status;
    if (req.query.priority) appliedFilters.priority = req.query.priority;
    if (req.query.project) appliedFilters.project = req.query.project;
    if (req.query.assignedTo) appliedFilters.assignedTo = req.query.assignedTo;
    
    // === Response ===
    res.status(200).json({
        success: true,
        message: "Tasks retrieved successfully",
        count: tasks.length,
        total,
        pagination: {
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
        },
        filters: {
            applied: appliedFilters,
            search: req.query.search || null,
            dateRange: {
                from: req.query.dueDateFrom || null,
                to: req.query.dueDateTo || null
            }
        },
        data: tasks
    });
}

    findTaskById = async (req, res) => {
        const task = await Task.findById(req.params.id)
            .populate("project", "name")
            .populate("assignedTo", "username email name avatar")
            .populate("assignedBy", "username email name")
            .populate({
            path: "notes",
            select: "content createdBy createdAt",
            options: { sort: { createdAt: -1 } }, 
            populate: {
                path: "createdBy",
                select: "username email name avatar"
            }
        })
        .lean();

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
        const assignedUser = await User.findById(assignedTo);
        if (!assignedUser) {
        res.status(404);
        throw new Error("Assigned user not found");
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
         const populatedTask = await Task.findById(task._id)
         .populate("project", "name description")
         .populate("assignedTo", "username email name avatar")
         .populate("assignedBy", "username email name avatar")
        .lean();

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

        // Send notification to assigned user
        await NotificationService.createAndSend(task.assignedTo, "NEW_TASK_ASSIGNED", {
            message: `You have been assigned a new task: "${task.title}"`,
            taskId: task._id,
            taskTitle: task.title,
            project: projectExists.name,
            dueDate: task.dueDate,
            priority: task.priority,
            assignedBy: req.user.name || req.user.username
        });


        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: task
        });
    }
updateTaskByManager = async (req, res) => {
    const taskId = req.params.id;
    const { role, id } = req.user;
    const updates = req.body;
    
    const task = await Task.findById(taskId);
    if (!task) {
        res.status(404);
        throw new Error("Task not found");
    }

    // حفظ الحقول قبل التحديث لتسجيل التغييرات
    const previousTaskState = {
        ...task._doc
    };

    // ===== Setting up allowed updates =====
    let allowedUpdates = {};
    let logAction = "";
    let logMetadata = {};

    if (role === USER_ROLES.MANAGER) {
        // The manager controls all fields
        const validFields = ['title', 'description', 'project', 'assignedTo', 
                            'dueDate', 'priority', 'status', 'tags'];
        
        Object.keys(updates).forEach(key => {
            if (validFields.includes(key)) {
                allowedUpdates[key] = updates[key];
            }
        });

        // تسجيل الحقول التي تم تغييرها
        const changedFields = Object.keys(allowedUpdates);
        const changes = {};
        
        changedFields.forEach(field => {
            changes[field] = {
                from: previousTaskState[field],
                to: allowedUpdates[field]
            };
        });

        logAction = "TASK_UPDATE";
        logMetadata = {
            byRole: role,
            changedFields: changedFields,
            changes: changes,
            updatedBy: id
        };

        //Check if the project is still active and has been updated
        if (allowedUpdates.project) {
            const projectExists = await Project.findById(allowedUpdates.project);
            if (!projectExists) {
                res.status(404);
                throw new Error("Project not found");
            }
            logMetadata.projectChanged = true;
        }

        // Check if the user is still active after the update
        if (allowedUpdates.assignedTo) {
            const userExists = await User.findById(allowedUpdates.assignedTo);
            if (!userExists) {
                res.status(404);
                throw new Error("Assigned user not found");
            }
            logMetadata.assignedToChanged = true;
            logMetadata.newAssignee = allowedUpdates.assignedTo;

            // Send notification to newly assigned user if assignment changed
            if (!previousTaskState.assignedTo || 
                previousTaskState.assignedTo.toString() !== allowedUpdates.assignedTo.toString()) {
                await NotificationService.createAndSend(allowedUpdates.assignedTo, "TASK_REASSIGNED", {
                    message: `You have been assigned to task: "${task.title}"`,
                    taskId: task._id,
                    taskTitle: task.title,
                    project: task.project,
                    assignedBy: req.user.name || req.user.username,
                    previousAssignee: previousTaskState.assignedTo
                });
            }
        }

    } else {
        // The team member controls the situation only
        const isAssignedTo = task.assignedTo && (
            (typeof task.assignedTo.equals === 'function' && task.assignedTo.equals(id)) ||
            task.assignedTo.toString() === id.toString()
        );
        
        console.log(`[DEBUG] Update Check: TaskAssignedTo=${task.assignedTo}, UserId=${id}, Match=${isAssignedTo}`);

        if (!isAssignedTo) {
            res.status(403);
            throw new Error("You can only update tasks assigned to you");
        }

        if (updates.status && Object.keys(updates).length === 1) {
            allowedUpdates.status = updates.status;
            
            logAction = "TASK_STATUS_UPDATE";
            logMetadata = {
                byRole: role,
                previousStatus: previousTaskState.status,
                newStatus: updates.status,
                updatedBy: id,
                taskId: taskId
            };

            // Notify the manager (Project Manager)
            const project = await Project.findById(task.project);
            if (project && project.manager) {
                await NotificationService.createAndSend(project.manager, "TASK_STATUS_UPDATED", {
                    message: `Task "${task.title}" status changed to ${updates.status}`,
                    taskId: task._id,
                    taskTitle: task.title,
                    oldStatus: previousTaskState.status,
                    newStatus: updates.status,
                    updatedBy: req.user.name || req.user.username
                });
            }
        } else {
            res.status(403);
            throw new Error("Team members can only update task status");
        }
    }

    // ===== Secure application for updates =====
    Object.keys(allowedUpdates).forEach(key => {
        task[key] = allowedUpdates[key];
    });

    await task.save();

    // ===== Activity Logging =====
    if (logAction && res.logActivity) {
        try {
            await res.logActivity({
                action: logAction,
                entityType: "Task",
                entityId: task._id,
                userId: id,
                userRole: role,
                timestamp: new Date(),
                metadata: logMetadata,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
        } catch (logError) {
            console.error("Failed to log activity:", logError);
            // لا نوقف العملية إذا فشل التسجيل
        }
    }

    // ===== Preparing Response =====
    const updatedTask = await Task.findById(task._id)
        .populate({
            path: "project",
            select: "name description status"
        })
        .populate({
            path: "assignedTo",
            select: "name email avatar role"
        })
        .populate({
            path: "assignedBy",
            select: "name email avatar role"
        })
        .lean();

    const now = new Date();
    const dueDate = updatedTask.dueDate ? new Date(updatedTask.dueDate) : null;
    
    const formattedTask = {
        ...updatedTask,
        isOverdue: dueDate && dueDate < now && updatedTask.status !== 'completed',
        daysLeft: dueDate ? Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)) : null
    };

    res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: formattedTask,
        activityLogged: !!logAction,
        changes: logMetadata.changedFields || [updates.status ? 'status' : null].filter(Boolean)
    });
}
    
    removeTaskByManager = async (req, res) => {
        const task = await Task.findById(req.params.id);

        if (!task) {
            res.status(404);
            throw new Error("Task not found");
        }
        await Note.deleteMany({ task: task._id });
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
