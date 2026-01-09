const express = require('express');
const router = express.Router();
const TaskController = require("../controllers/task.controller");
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const { addTaskByManagerValidator, updateTaskByManagerValidator, validateMongoId } = require('../validation/task.validation');
const { USER_ROLES } = require('../utils/constants');

router.use(requireAuth);

router.get('/', asyncHandler(TaskController.getAllTask));

router.get('/:id', 
    validateMongoId('id'),
    validate,
    asyncHandler(TaskController.findTaskById)
);

router.post('/', 
    authorize(USER_ROLES.MANAGER),
    addTaskByManagerValidator,
    validate,
    asyncHandler(TaskController.addTaskByManager)
);

router.put('/:id', 
    validateMongoId('id'),
    updateTaskByManagerValidator,
    validate,
    asyncHandler(TaskController.updateTaskByManager)
);

router.delete('/:id', 
    authorize(USER_ROLES.MANAGER),
    validateMongoId('id'),
    validate,
    asyncHandler(TaskController.removeTaskByManager)
);

module.exports = router;
