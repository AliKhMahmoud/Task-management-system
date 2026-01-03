const express = require('express');
const router = express.Router();
const TaskController = require("../controllers/task.controller");
const asyncHandler = require('../utils/asyncHandler');
const { apiLimiter } = require('../middlewares/rateLimit.middleware');

// TODO: Add note routes here
// Example:

// router.get('/',
//     [
//         apiLimiter
//     ],
//     asyncHandler(TaskController.getAllTask)
// );

// router.get('/:id', 
//     [
//         apiLimiter
//     ],
//     asyncHandler(TaskController.findTaskById)
// );

// router.post('/', 
//     [
//         apiLimiter
//     ],
//     asyncHandler(TaskController.addTaskByManager)
// );

// router.put('/:id', 
//     [
//         apiLimiter
//     ],
//     asyncHandler(TaskController.updateTaskByManager)
// );

// router.delete('/:id', 
//     [
//         apiLimiter
//     ],
//     asyncHandler(TaskController.removeTaskByManager)
// );

module.exports = router;
