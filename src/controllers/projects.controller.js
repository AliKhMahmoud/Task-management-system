const Project = require("../models/Project");
const { projectsService } = require("../services/projects.service.js");
const { activityService } = require("../services/activity.service.js");

class ProjectController {

  
  async createProjectByManager(req, res, next) {
    try {
      const project = await projectsService.create({ ...req.body, createdBy: req.user.id });

      await activityService.log({
        actorId: req.user.id,
        action: "project.created",
        entityType: "Project",
        entityId: project._id,
        meta: { name: project.name },
      });

      res.status(201).json(project);
    } catch (e) {
      next(e);
    }
  }

 
  async getAllProjects(req, res, next) {
    try {
      const projects = await projectsService.list({ user: req.user, memberId: req.query.memberId });
      res.json(projects);
    } catch (e) {
      next(e);
    }
  }

  
  async getProjectById(req, res, next) {
    try {
      const project = await projectsService.getById(req.params.id);

      if (req.user.role === "TeamMember") {
        const isMember = (project.members || []).some((m) => String(m) === String(req.user.id));
        if (!isMember) return res.status(403).json({ message: "Forbidden" });
      }

      res.json(project);
    } catch (e) {
      next(e);
    }
  }

  
  async updateProjectByManager(req, res, next) {
    try {
      const project = await projectsService.update(req.params.id, req.body);

      await activityService.log({
        actorId: req.user.id,
        action: "project.updated",
        entityType: "Project",
        entityId: project._id,
        meta: { patchKeys: Object.keys(req.body || {}) },
      });

      res.json(project);
    } catch (e) {
      next(e);
    }
  }

  
  async removeProjectByManager(req, res, next) {
    try {
      await projectsService.remove(req.params.id);

      await activityService.log({
        actorId: req.user.id,
        action: "project.deleted",
        entityType: "Project",
        entityId: req.params.id,
      });

      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }

 
  async addMemberByManager(req, res, next) {
    try {
      const project = await projectsService.getById(req.params.id);
      const incoming = req.body.memberIds || [];
      const merged = Array.from(new Set([...(project.members || []).map(String), ...incoming.map(String)]));
      project.members = merged;
      await project.save();

      await activityService.log({
        actorId: req.user.id,
        action: "project.members_added",
        entityType: "Project",
        entityId: project._id,
        meta: { added: incoming },
      });

      res.json(project);
    } catch (e) {
      next(e);
    }
  }

  
  async removeMemberByManager(req, res, next) {
    try {
      const project = await projectsService.getById(req.params.id);
      const memberId = req.params.memberId;

      project.members = (project.members || []).filter((m) => String(m) !== String(memberId));
      await project.save();

      await activityService.log({
        actorId: req.user.id,
        action: "project.member_removed",
        entityType: "Project",
        entityId: project._id,
        meta: { removed: memberId },
      });

      res.json(project);
    } catch (e) {
      next(e);
    }
  }

}

module.exports = new ProjectController();
