const Project = require("../models/Project");

class ProjectController {
  async createProjectByManager(req, res) {
    if (req.user.role !== "Manager") {
      const err = new Error("Forbidden");
      err.statusCode = 403;
      throw err;
    }

    const project = await Project.create({
      ...req.body,
      manager: req.user.id,
    });

    res.status(201).json(project);
  }

  async getAllProjects(req, res) {
    const filter = {};

    if (req.user.role === "Manager") {
      filter.manager = req.user.id;

      if (req.query.memberId) {
        filter.members = req.query.memberId;
      }
    } else if (req.user.role === "TeamMember") {
      filter.members = req.user.id;
    } else {
      const err = new Error("Forbidden");
      err.statusCode = 403;
      throw err;
    }

    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.status(200).json(projects);
  }

  async getProjectById(req, res) {
    const project = await Project.findById(req.params.id);
    if (!project) {
      const err = new Error("Project not found");
      err.statusCode = 404;
      throw err;
    }

    if (req.user.role === "Manager") {
      if (String(project.manager) !== String(req.user.id)) {
        const err = new Error("Forbidden");
        err.statusCode = 403;
        throw err;
      }
    }

    if (req.user.role === "TeamMember") {
      const isMember = (project.members || []).some(
        (m) => String(m) === String(req.user.id)
      );
      if (!isMember) {
        const err = new Error("Forbidden");
        err.statusCode = 403;
        throw err;
      }
    }

    res.status(200).json(project);
  }

  async updateProjectByManager(req, res) {
    if (req.user.role !== "Manager") {
      const err = new Error("Forbidden");
      err.statusCode = 403;
      throw err;
    }

    const patch = { ...(req.body || {}) };
    delete patch.manager;
    delete patch.createdBy;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, manager: req.user.id },
      patch,
      { new: true, runValidators: true }
    );

    if (!project) {
      const err = new Error("Project not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json(project);
  }

  async removeProjectByManager(req, res) {
    if (req.user.role !== "Manager") {
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

    res.status(204).send();
  }

  async addMemberByManager(req, res) {
    if (req.user.role !== "Manager") {
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

    res.status(200).json(project);
  }

  async removeMemberByManager(req, res) {
    if (req.user.role !== "Manager") {
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

    res.status(200).json(project);
  }
}

module.exports = new ProjectController();
