// const express = require("express");
// const projectController = require("../controllers/projects.controller");
// const asyncHandler = require("../utils/asyncHandler");
// const { apiLimiter } = require("../middlewares/rateLimit.middleware");

// const router = express.Router();

// // Projects CRUD
// router.post(
//   "/",
//   [apiLimiter],
//   asyncHandler(projectController.createProjectByManager)
// );

// router.get(
//   "/",
//   [apiLimiter],
//   asyncHandler(projectController.getAllProjects)
// );

// router.get(
//   "/:id",
//   [apiLimiter],
//   asyncHandler(projectController.getProjectById)
// );

// router.put(
//   "/:id",
//   [apiLimiter],
//   asyncHandler(projectController.updateProjectByManager)
// );

// router.delete(
//   "/:id",
//   [apiLimiter],
//   asyncHandler(projectController.removeProjectByManager)
// );

// // Members management
// router.post(
//   "/:id/members",
//   [apiLimiter],
//   asyncHandler(projectController.addMemberByManager)
// );

// router.delete(
//   "/:id/members/:memberId",
//   [apiLimiter],
//   asyncHandler(projectController.removeMemberByManager)
// );

// module.exports = router;
const express = require("express");
const projectController = require("../controllers/projects.controller");
const asyncHandler = require("../utils/asyncHandler");
const { apiLimiter } = require("../middlewares/rateLimit.middleware");
const { requireAuth, authorize } = require("../middlewares/auth.middleware"); // أضف هذا
const { USER_ROLES } = require('../utils/constants'); // أضف هذا

const router = express.Router();

// ⚠️ مهم: أضف requireAuth لجميع المسارات
router.use(apiLimiter);
router.use(requireAuth); // هذا يحل المشكلة الرئيسية

// Projects CRUD
router.post(
  "/",
  authorize(USER_ROLES.MANAGER), // فقط المدير
  asyncHandler(projectController.createProjectByManager)
);

router.get(
  "/",
  asyncHandler(projectController.getAllProjects)
);

router.get(
  "/:id",
  asyncHandler(projectController.getProjectById)
);

router.put(
  "/:id",
  authorize(USER_ROLES.MANAGER), // فقط المدير
  asyncHandler(projectController.updateProjectByManager)
);

router.delete(
  "/:id",
  authorize(USER_ROLES.MANAGER), // فقط المدير
  asyncHandler(projectController.removeProjectByManager)
);

// Members management
router.post(
  "/:id/members",
  authorize(USER_ROLES.MANAGER), // فقط المدير
  asyncHandler(projectController.addMemberByManager)
);

router.delete(
  "/:id/members/:memberId",
  authorize(USER_ROLES.MANAGER), // فقط المدير
  asyncHandler(projectController.removeProjectByManager)
);

module.exports = router;