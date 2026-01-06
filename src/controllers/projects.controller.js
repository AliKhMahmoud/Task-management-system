// const Project = require("../models/Project");

// class ProjectController {
//   async createProjectByManager(req, res) {
//     if (req.user.role !== "Manager") {
//       const err = new Error("Forbidden");
//       err.statusCode = 403;
//       throw err;
//     }

//     const project = await Project.create({
//       ...req.body,
//       manager: req.user.id,
//     });

//     res.status(201).json(project);
//   }

//   async getAllProjects(req, res) {
//     const filter = {};

//     if (req.user.role === "Manager") {
//       filter.manager = req.user.id;

//       if (req.query.memberId) {
//         filter.members = req.query.memberId;
//       }
//     } else if (req.user.role === "TeamMember") {
//       filter.members = req.user.id;
//     } else {
//       const err = new Error("Forbidden");
//       err.statusCode = 403;
//       throw err;
//     }

//     const projects = await Project.find(filter).sort({ createdAt: -1 });
//     res.status(200).json(projects);
//   }

//   async getProjectById(req, res) {
//     const project = await Project.findById(req.params.id);
//     if (!project) {
//       const err = new Error("Project not found");
//       err.statusCode = 404;
//       throw err;
//     }

//     if (req.user.role === "Manager") {
//       if (String(project.manager) !== String(req.user.id)) {
//         const err = new Error("Forbidden");
//         err.statusCode = 403;
//         throw err;
//       }
//     }

//     if (req.user.role === "TeamMember") {
//       const isMember = (project.members || []).some(
//         (m) => String(m) === String(req.user.id)
//       );
//       if (!isMember) {
//         const err = new Error("Forbidden");
//         err.statusCode = 403;
//         throw err;
//       }
//     }

//     res.status(200).json(project);
//   }

//   async updateProjectByManager(req, res) {
//     if (req.user.role !== "Manager") {
//       const err = new Error("Forbidden");
//       err.statusCode = 403;
//       throw err;
//     }

//     const patch = { ...(req.body || {}) };
//     delete patch.manager;
//     delete patch.createdBy;

//     const project = await Project.findOneAndUpdate(
//       { _id: req.params.id, manager: req.user.id },
//       patch,
//       { new: true, runValidators: true }
//     );

//     if (!project) {
//       const err = new Error("Project not found");
//       err.statusCode = 404;
//       throw err;
//     }

//     res.status(200).json(project);
//   }

//   async removeProjectByManager(req, res) {
//     if (req.user.role !== "Manager") {
//       const err = new Error("Forbidden");
//       err.statusCode = 403;
//       throw err;
//     }

//     const result = await Project.deleteOne({
//       _id: req.params.id,
//       manager: req.user.id,
//     });

//     if (result.deletedCount === 0) {
//       const err = new Error("Project not found");
//       err.statusCode = 404;
//       throw err;
//     }

//     res.status(204).send();
//   }

//   async addMemberByManager(req, res) {
//     if (req.user.role !== "Manager") {
//       const err = new Error("Forbidden");
//       err.statusCode = 403;
//       throw err;
//     }

//     const memberIds = req.body.memberIds;
//     if (!Array.isArray(memberIds)) {
//       const err = new Error("memberIds must be an array");
//       err.statusCode = 400;
//       throw err;
//     }

//     const project = await Project.findOne({
//       _id: req.params.id,
//       manager: req.user.id,
//     });

//     if (!project) {
//       const err = new Error("Project not found");
//       err.statusCode = 404;
//       throw err;
//     }

//     const current = (project.members || []).map(String);
//     const incoming = memberIds.map(String);

//     project.members = Array.from(new Set([...current, ...incoming]));
//     await project.save();

//     res.status(200).json(project);
//   }

//   async removeMemberByManager(req, res) {
//     if (req.user.role !== "Manager") {
//       const err = new Error("Forbidden");
//       err.statusCode = 403;
//       throw err;
//     }

//     const project = await Project.findOne({
//       _id: req.params.id,
//       manager: req.user.id,
//     });

//     if (!project) {
//       const err = new Error("Project not found");
//       err.statusCode = 404;
//       throw err;
//     }

//     const memberId = req.params.memberId;
//     project.members = (project.members || []).filter(
//       (m) => String(m) !== String(memberId)
//     );
//     await project.save();

//     res.status(200).json(project);
//   }
// }

// module.exports = new ProjectController();
const Project = require("../models/Project");
const { USER_ROLES } = require('../utils/constants'); // تأكد من استيراد الثوابت

class ProjectController {
  async createProjectByManager(req, res) {
    // ⚠️ تصحيح: استخدم الثوابت بدلاً من strings مباشرة
    if (req.user.role !== USER_ROLES.MANAGER) {
      const err = new Error("Forbidden");
      err.statusCode = 403;
      throw err;
    }

    const project = await Project.create({
      ...req.body,
      manager: req.user.id,
    });

    // تحسين الاستجابة لتكون متسقة مع باقي APIs
    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project
    });
  }

  async getAllProjects(req, res) {
    const filter = {};

    // ⚠️ تصحيح: استخدم الثوابت
    if (req.user.role === USER_ROLES.MANAGER) {
      filter.manager = req.user.id;

      if (req.query.memberId) {
        filter.members = req.query.memberId;
      }
    } else if (req.user.role === USER_ROLES.TEAM_MEMBER) { // ⚠️ تصحيح: TEAM_MEMBER
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

    // ⚠️ تصحيح: استخدم الثوابت
    if (req.user.role === USER_ROLES.MANAGER) {
      if (String(project.manager) !== String(req.user.id)) {
        const err = new Error("Forbidden");
        err.statusCode = 403;
        throw err;
      }
    }

    // ⚠️ تصحيح: استخدم الثوابت
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

  // async updateProjectByManager(req, res) {
  //   // ⚠️ تصحيح: استخدم الثوابت
  //   if (req.user.role !== USER_ROLES.MANAGER) {
  //     const err = new Error("Forbidden");
  //     err.statusCode = 403;
  //     throw err;
  //   }

  //   const patch = { ...(req.body || {}) };
  //   delete patch.manager;
  //   delete patch.createdBy;

  //   const project = await Project.findOneAndUpdate(
  //     { _id: req.params.id, manager: req.user.id },
  //     patch,
  //     { new: true, runValidators: true }
  //   );

  //   if (!project) {
  //     const err = new Error("Project not found");
  //     err.statusCode = 404;
  //     throw err;
  //   }

  //   res.status(200).json({
  //     success: true,
  //     message: "Project updated successfully",
  //     data: project
  //   });
  // }
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

  // 4. التحديث بدون runValidators
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, manager: req.user.id },
    updates,
    { 
      new: true, 
      runValidators: false  // ⚠️ إيقاف التحقق التلقائي
    }
  );

  res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: project
  });
}
  async removeProjectByManager(req, res) {
    // ⚠️ تصحيح: استخدم الثوابت
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

    // ⚠️ تصحيح: 200 بدلاً من 204 مع استجابة JSON
    res.status(200).json({
      success: true,
      message: "Project deleted successfully"
    });
  }

  async addMemberByManager(req, res) {
    // ⚠️ تصحيح: استخدم الثوابت
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
    // ⚠️ تصحيح: استخدم الثوابت
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