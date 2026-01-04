const express = require("express");
const projectController = require("../controllers/projects.controller");
const asyncHandler = require("../utils/asyncHandler");
const { apiLimiter } = require("../middlewares/rateLimit.middleware");

const router = express.Router();

// Projects CRUD
router.post(
  "/",
  [apiLimiter],
  asyncHandler(projectController.createProjectByManager)
);

router.get(
  "/",
  [apiLimiter],
  asyncHandler(projectController.getAllProjects)
);

router.get(
  "/:id",
  [apiLimiter],
  asyncHandler(projectController.getProjectById)
);

router.put(
  "/:id",
  [apiLimiter],
  asyncHandler(projectController.updateProjectByManager)
);

router.delete(
  "/:id",
  [apiLimiter],
  asyncHandler(projectController.removeProjectByManager)
);

// Members management
router.post(
  "/:id/members",
  [apiLimiter],
  asyncHandler(projectController.addMemberByManager)
);

router.delete(
  "/:id/members/:memberId",
  [apiLimiter],
  asyncHandler(projectController.removeMemberByManager)
);

module.exports = router;
