const Project = require("../models/Project");
const Task = require("../models/Task")
const Task = require("../models/Task")
const { USER_ROLES } = require('../utils/constants'); 


class ProjectController {


  async createProjectByManager(req, res) {
    if (req.user.role !== USER_ROLES.MANAGER) {
      const err = new Error("Forbidden");
      err.statusCode = 403;
      throw err;
    }
    const { name, description, startDate, endDate } = req.body;
    const { name, description, startDate, endDate } = req.body;
    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      name,
      description,
      startDate,
      endDate,
      manager: req.user.id,
      status: "active", 
      progress: 0,         
    });

    // Activity Log
    res.logActivity({
      action: "PROJECT_CREATE",
      entityType: "Project",
      entityId: project._id,
      metadata: { name: project.name }
    });


    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project
    });
  }

  async getAllProjects(req, res) {
    let filter = {};
    let filter = {};

    if (req.user.role === USER_ROLES.MANAGER) {
      filter.manager = req.user.id;

      if (req.query.memberId) {
        filter.members = req.query.memberId;
      }
    } else if (req.user.role === USER_ROLES.TEAM_MEMBER) { 
      filter.members = req.user.id;
    } else {
      const err = new Error("Forbidden");
      err.statusCode = 403;
      throw err;
    }

    const projects = await Project.find(filter)
    .populate('manager', 'name email')
    .populate('members', 'name email')
    .sort({ createdAt: -1 });
    const projects = await Project.find(filter)
    .populate('manager', 'name email')
    .populate('members', 'name email')
    .sort({ createdAt: -1 });
    


    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  }

  async getProjectById(req, res) {
    const project = await Project.findById(req.params.id)
    .populate('members', 'name email')

    const project = await Project.findById(req.params.id)
    .populate('members', 'name email')

    if (!project) {
      const err = new Error("Project not found");
      err.statusCode = 404;
      throw err;
    }

    if (req.user.role === USER_ROLES.MANAGER) {
      if (String(project.manager) !== String(req.user.id)) {
        const err = new Error("Forbidden");
        err.statusCode = 403;
        throw err;
      }
    }

    if (req.user.role === USER_ROLES.TEAM_MEMBER) {
      const isMember = (project.members || []).some(
        (m) => String(m) === String(req.user.id)
      );
      if (!isMember) {
        const err = new Error("Forbidden");
        err.statusCode = 403;
        throw err;
      }
    }

    res.status(200).json({
      success: true,
      data: project
    });
  }

  async updateProjectByManager(req, res) {

    if (req.user.role !== USER_ROLES.MANAGER) {
      const err = new Error("Forbidden");
      err.statusCode = 403;
      throw err;
    }
  async updateProjectByManager(req, res) {

    if (req.user.role !== USER_ROLES.MANAGER) {
      const err = new Error("Forbidden");
      err.statusCode = 403;
      throw err;
    }

    const existingProject = await Project.findOne({
      _id: req.params.id,
      manager: req.user.id
    });
    const existingProject = await Project.findOne({
      _id: req.params.id,
      manager: req.user.id
    });

    if (!existingProject) {
      const err = new Error("Project not found");
      err.statusCode = 404;
      throw err;
    }
    const startDate = req.body.startDate ? new Date(req.body.startDate) : existingProject.startDate;
    const endDate = req.body.endDate ? new Date(req.body.endDate) : existingProject.endDate;
    if (!existingProject) {
      const err = new Error("Project not found");
      err.statusCode = 404;
      throw err;
    }
    const startDate = req.body.startDate ? new Date(req.body.startDate) : existingProject.startDate;
    const endDate = req.body.endDate ? new Date(req.body.endDate) : existingProject.endDate;

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        error: `End date (${endDate}) must be after start date (${startDate})`
      });
    }
    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        error: `End date (${endDate}) must be after start date (${startDate})`
      });
    }

    const updates = {};
    
    const allowedFields = ['name', 'description', 'status', 'progress', 'startDate', 'endDate'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    const updates = {};
    
    const allowedFields = ['name', 'description', 'status', 'progress', 'startDate', 'endDate'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, manager: req.user.id },
      updates,
      { 
        new: true, 
        runValidators: false  
      }
    );
    // Activity Log
    res.logActivity({
      action: "PROJECT_UPDATE",
      entityType: "Project",
      entityId: project._id,
      metadata: {
        changedFields: Object.keys(updates),
        name: project.name
      }
    });

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project
    });
  }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project
    });
  }

  async removeProjectByManager(req, res) {
    if (req.user.role !== USER_ROLES.MANAGER) {
      const err = new Error("Forbidden");
      err.statusCode = 403;
      throw err;
    }

    const project = await Project.findOne({
    const project = await Project.findOne({
      _id: req.params.id,
      manager: req.user.id,
    });

    if (!project) {
      const err = new Error("Project not found or unauthorized");
    if (!project) {
      const err = new Error("Project not found or unauthorized");
      err.statusCode = 404;
      throw err;
    }


    await Task.deleteMany({ project: req.params.id }); 

    await project.deleteOne();

    // Activity Log
    res.logActivity({
      action: "PROJECT_DELETE",
      entityType: "Project",
      entityId: req.params.id,
      metadata: {}
    });


    res.status(200).json({
      success: true,
      message: "Project and its related data deleted successfully"
      message: "Project and its related data deleted successfully"
    });
  }

  async addMemberByManager(req, res) {
    if (req.user.role !== USER_ROLES.MANAGER) {
      const err = new Error("Forbidden");
      err.statusCode = 403;
      throw err;
    }

    const memberIds = req.body.memberIds;
    if (!Array.isArray(memberIds)) {
      const err = new Error("memberIds must be an array");
      err.statusCode = 400;
      throw err;
    }

    const project = await Project.findOne({
      _id: req.params.id,
      manager: req.user.id,
    });

    if (!project) {
      const err = new Error("Project not found");
      err.statusCode = 404;
      throw err;
    }

    const current = (project.members || []).map(String);
    const incoming = memberIds.map(String);

    project.members = Array.from(new Set([...current, ...incoming]));

    // Activity Log
    const before = (project.members || []).map(String);
    await project.save();
    await project.populate('members', 'name email');

    const added = incoming.filter(x => !before.includes(x));

    res.logActivity({
      action: "PROJECT_ADD_MEMBER",
      entityType: "Project",
      entityId: project._id,
      metadata: { addedMemberIds: added }
    });


    res.status(200).json({
      success: true,
      message: "Members added successfully",
      data: project
    });
  }

  async removeMemberByManager(req, res) {
    if (req.user.role !== USER_ROLES.MANAGER) {
      const err = new Error("Forbidden");
      err.statusCode = 403;
      throw err;
    }

    const project = await Project.findOne({
      _id: req.params.id,
      manager: req.user.id,
    });

    if (!project) {
      const err = new Error("Project not found");
      err.statusCode = 404;
      throw err;
    }

    const memberId = req.params.memberId;
    project.members = (project.members || []).filter(
      (m) => String(m) !== String(memberId)
    );
    await project.save();
    await project.populate('members', 'name email')

    // Activity Log
    res.logActivity({
      action: "PROJECT_REMOVE_MEMBER",
      entityType: "Project",
      entityId: project._id,
      metadata: { removedMemberId: req.params.memberId }
    });


    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      data: project
    });
  }
}

module.exports = new ProjectController();