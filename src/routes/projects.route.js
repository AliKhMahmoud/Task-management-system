const express = require('express');
const projectController = require('../controllers/projects.controller');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { apiLimiter } = require('../middlewares/rateLimit.middleware');
const { Roles } = require('../utils/constants');

const router = express.Router();


router.use(requireAuth);

router.post(
  '/',
  requireRole([Roles.MANAGER]),
  apiLimiter,
  asyncHandler(projectController.createProjectByManager)
);

router.get(
  '/',
  apiLimiter,
  asyncHandler(projectController.getAllProjects)
);

router.get(
  '/:id',
  apiLimiter,
  asyncHandler(projectController.getProjectById)
);

router.put(
  '/:id',
  requireRole([Roles.MANAGER]),
  apiLimiter,
  asyncHandler(projectController.updateProjectByManager)
);

router.patch(
  '/:id',
  requireRole([Roles.MANAGER]),
  apiLimiter,
  asyncHandler(projectController.updateProjectByManager)
);

router.delete(
  '/:id',
  requireRole([Roles.MANAGER]),
  apiLimiter,
  asyncHandler(projectController.removeProjectByManager)
);

-
router.post(
  '/:id/members',
  requireRole([Roles.MANAGER]),
  apiLimiter,
  asyncHandler(projectController.addMemberByManager)
);

router.delete(
  '/:id/members/:memberId',
  requireRole([Roles.MANAGER]),
  apiLimiter,
  asyncHandler(projectController.removeMemberByManager)
);


router.post(
  '/:projectId/tasks',
  requireRole([Roles.MANAGER]),
  apiLimiter,
  asyncHandler(projectController.createTask)
);

module.exports = router;
