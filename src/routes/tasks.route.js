const express = require('express');
const { body } = require('express-validator');
const TaskController = require('../controllers/task.controller');
const asyncHandler = require('../utils/asyncHandler');
const { apiLimiter } = require('../middlewares/rateLimit.middleware');
const { protect } = require('../middlewares/auth.middleware');
const { isManager } = require('../middlewares/role.middleware');
const { validate, validateObjectId } = require('../middlewares/validation.middleware');
const { TASK_STATUS, TASK_PRIORITY } = require('../utils/constants');

const router = express.Router();


router.use(protect);


router.get(
  '/',
  apiLimiter,
  asyncHandler(TaskController.getTasks)
);
router.get(
  '/:id',
  apiLimiter,
  validateObjectId(),
  asyncHandler(TaskController.getTask)
);


router.post(
  '/',
  isManager,
  apiLimiter,
  [
    body('title').trim().notEmpty().withMessage('عنوان المهمة مطلوب'),
    body('description').optional().trim(),
    body('project').isMongoId().withMessage('معرف المشروع غير صحيح'),
    body('assignedTo').isMongoId().withMessage('معرف المستخدم غير صحيح'),
    body('dueDate').isISO8601().withMessage('تاريخ التسليم غير صحيح'),
    body('priority').optional().isIn(Object.values(TASK_PRIORITY)),
    body('tags').optional().isArray(),
  ],
  validate,
  asyncHandler(TaskController.createTask)
);


router.put(
  '/:id',
  apiLimiter,
  validateObjectId(),
  [
    body('title').optional().trim().notEmpty().withMessage('عنوان المهمة مطلوب'),
    body('description').optional().trim(),
    body('dueDate').optional().isISO8601().withMessage('تاريخ التسليم غير صحيح'),
    body('priority').optional().isIn(Object.values(TASK_PRIORITY)),
    body('status').optional().isIn(Object.values(TASK_STATUS)),
    body('assignedTo').optional().isMongoId().withMessage('معرف المستخدم غير صحيح'),
    body('tags').optional().isArray(),
  ],
  validate,
  asyncHandler(TaskController.updateTaskByManager)
);


router.delete(
  '/:id',
  apiLimiter,
  isManager,
  validateObjectId(),
  asyncHandler(TaskController.removeTaskByManager)
);

module.exports = router;

