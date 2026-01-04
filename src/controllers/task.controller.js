const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const APIFeatures = require('../utils/apiFeatures');
const { HTTP_STATUS, ACTIVITY_TYPES } = require('../utils/constants');

class TaskController {

  
  async getAllTask(req, res) {
    try {
      let query = {};
      if (req.user.role === 'Team Member') {
        query.assignedTo = req.user._id;
      }

      if (req.query.project) query.project = req.query.project;
      if (req.query.status) query.status = req.query.status;
      if (req.query.priority) query.priority = req.query.priority;

      const features = new APIFeatures(
        Task.find(query)
          .populate('project', 'name')
          .populate('assignedTo', 'name email')
          .populate('assignedBy', 'name email'),
        req.query
      )
        .filter()
        .search(['title', 'description'])
        .sort()
        .limitFields()
        .paginate();

      const tasks = await features.query;
      const total = await Task.countDocuments(features.query.getQuery());
      const pagination = await features.getPaginationInfo(total);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        count: tasks.length,
        pagination,
        data: { tasks }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

 
  async findTaskById(req, res) {
    try {
      const task = await Task.findById(req.params.id)
        .populate('project', 'name description')
        .populate('assignedTo', 'name email')
        .populate('assignedBy', 'name email')
        .populate({
          path: 'notes',
          populate: {
            path: 'createdBy',
            select: 'name email'
          },
          options: { sort: { createdAt: -1 } }
        });

      if (!task) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Task not found'
        });
      }

      if (
        req.user.role === 'Team Member' &&
        task.assignedTo._id.toString() !== req.user._id.toString()
      ) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Not allowed to view this task'
        });
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { task }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

 
  async addTaskByManager(req, res) {
    try {
      const { title, description, project, assignedTo, dueDate, priority, tags } = req.body;

      const projectExists = await Project.findById(project);
      if (!projectExists) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Project not found'
        });
      }

      const task = await Task.create({
        title,
        description,
        project,
        assignedTo,
        assignedBy: req.user._id,
        dueDate,
        priority: priority || 'medium',
        tags: tags || []
      });

      await ActivityLog.create({
        user: req.user._id,
        activityType: ACTIVITY_TYPES.TASK_CREATED,
        entityType: 'Task',
        entityId: task._id,
        description: `Task created: ${task.title}`
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: { task }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  
  async updateTaskByManager(req, res) {
    try {
      let task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Task not found'
        });
      }

      const isAssignedTo = task.assignedTo.toString() === req.user._id.toString();
      const isManager = req.user.role === 'Manager';

      if (!isAssignedTo && !isManager) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Not allowed to update this task'
        });
      }

      const { title, description, dueDate, priority, status, tags, assignedTo } = req.body;
      const oldStatus = task.status;

      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (dueDate) task.dueDate = dueDate;
      if (priority) task.priority = priority;
      if (tags) task.tags = tags;

      if (isManager) {
        if (status) task.status = status;
        if (assignedTo) task.assignedTo = assignedTo;
      } else if (isAssignedTo && status) {
        task.status = status;
      }

      await task.save();

      if (status && status !== oldStatus) {
        await ActivityLog.create({
          user: req.user._id,
          activityType: ACTIVITY_TYPES.TASK_STATUS_CHANGED,
          entityType: 'Task',
          entityId: task._id,
          description: `Task "${task.title}" status changed from ${oldStatus} to ${status}`
        });
      } else {
        await ActivityLog.create({
          user: req.user._id,
          activityType: ACTIVITY_TYPES.TASK_UPDATED,
          entityType: 'Task',
          entityId: task._id,
          description: `Task updated: ${task.title}`
        });
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { task }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  
  async removeTaskByManager(req, res) {
    try {
      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Task not found'
        });
      }

      await task.deleteOne();

      await ActivityLog.create({
        user: req.user._id,
        activityType: ACTIVITY_TYPES.TASK_DELETED,
        entityType: 'Task',
        entityId: task._id,
        description: `Task deleted: ${task.title}`
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Task deleted successfully'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

}

module.exports = new TaskController();
