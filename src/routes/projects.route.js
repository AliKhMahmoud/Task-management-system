
const express = require("express");
const projectController = require("../controllers/projects.controller");
const asyncHandler = require("../utils/asyncHandler");
const { apiLimiter } = require("../middlewares/rateLimit.middleware");
const { requireAuth, authorize } = require("../middlewares/auth.middleware"); 
const { USER_ROLES } = require('../utils/constants'); 
const { createProjectByManagerValidator, getAllProjectsValidator,
  getProjectByIdValidator, updateProjectValidator, deleteProjectValidator,
  addMemberValidator, removeMemberValidator } = require("../validation/project.validation");
const validate = require("../middlewares/validation.middleware");

const router = express.Router();

router.use(requireAuth); 

// Projects CRUD
router.post(
  "/",
  [
    authorize(USER_ROLES.MANAGER),
    ...createProjectByManagerValidator,
    validate
  ], 
  asyncHandler(projectController.createProjectByManager)
);

router.get("/",
  [
    ...getAllProjectsValidator,
    validate,
  ],
  asyncHandler(projectController.getAllProjects)
);

router.get("/:id",
  [
    ...getProjectByIdValidator,
    validate
  ],
  asyncHandler(projectController.getProjectById)
);

router.put("/:id",
  [
    authorize(USER_ROLES.MANAGER),
    ...updateProjectValidator,
    validate
  ], 
  asyncHandler(projectController.updateProjectByManager)
);

router.delete("/:id",
  [
    [authorize(USER_ROLES.MANAGER)],
    ...deleteProjectValidator,
    validate
  ], 
  asyncHandler(projectController.removeProjectByManager)
);

// Members management
router.post("/:id/members",
  [
    authorize(USER_ROLES.MANAGER),
    ...addMemberValidator,
    validate
  ], 
  asyncHandler(projectController.addMemberByManager)
);

router.delete("/:id/members/:memberId",
  [
    authorize(USER_ROLES.MANAGER),
    ...removeMemberValidator,
    validate
  ], 
  asyncHandler(projectController.removeMemberByManager)
);

module.exports = router;