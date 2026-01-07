
// module.exports = new ProjectController();
const Project = require("../models/Project");
const { USER_ROLES } = require('../utils/constants'); 

class ProjectController {

  async createProjectByManager(req, res) {
    if (req.user.role !== USER_ROLES.MANAGER) {
      const err = new Error("Forbidden");
      err.statusCode = 403;
      throw err;
    }

    const project = await Project.create({
      ...req.body,
      manager: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project
    });
  }

  async getAllProjects(req, res) {
    const filter = {};

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

    const projects = await Project.find(filter).sort({ createdAt: -1 });
    
    // تحسين الاستجابة
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  }

  async getProjectById(req, res) {
    const project = await Project.findById(req.params.id);
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

  // 1. احصل على المشروع الحالي أولاً
  const existingProject = await Project.findOne({
    _id: req.params.id,
    manager: req.user.id
  });

  if (!existingProject) {
    const err = new Error("Project not found");
    err.statusCode = 404;
    throw err;
  }

  // 2. التحقق من التواريخ يدوياً
  const startDate = req.body.startDate ? new Date(req.body.startDate) : existingProject.startDate;
  const endDate = req.body.endDate ? new Date(req.body.endDate) : existingProject.endDate;

  if (endDate <= startDate) {
    return res.status(400).json({
      success: false,
      error: `End date (${endDate}) must be after start date (${startDate})`
    });
  }

  // 3. تحديث الحقول
  const updates = {};
  
  // فقط الحقول المسموح بها
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

    const result = await Project.deleteOne({
      _id: req.params.id,
      manager: req.user.id,
    });

    if (result.deletedCount === 0) {
      const err = new Error("Project not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully"
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
    await project.save();

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

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      data: project
    });
  }
}

module.exports = new ProjectController();