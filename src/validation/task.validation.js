const { body, param } = require("express-validator");
const { TASK_STATUS, TASK_PRIORITY } = require("../utils/constants");
const mongoose = require("mongoose");

const validateMongoId = (field) => {
    return param(field).custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error(`Invalid ${field}`);
        }
        return true;
    });
};

const addTaskByManagerValidator = [
    body("title")
        .notEmpty()
        .withMessage("Title is required")
        .trim()
        .isLength({ min: 3 })
        .withMessage("Title must be at least 3 characters long"),
    body("project")
        .notEmpty()
        .withMessage("Project ID is required")
        .isMongoId()
        .withMessage("Invalid Project ID"),
    body("assignedTo")
        .notEmpty()
        .withMessage("Assigned User ID is required")
        .isMongoId()
        .withMessage("Invalid User ID"),
    body("dueDate")
        .notEmpty()
        .withMessage("Due date is required")
        .isISO8601()
        .withMessage("Invalid date format"),
    body("priority")
        .optional()
        .isIn(Object.values(TASK_PRIORITY))
        .withMessage("Invalid priority"),
    body("status")
        .optional()
        .isIn(Object.values(TASK_STATUS))
        .withMessage("Invalid status"),
    body("description")
        .optional()
        .isString()
        .trim()
];

const updateTaskByManagerValidator = [
    body("title")
        .optional()
        .trim()
        .isLength({ min: 3 }),
    body("priority")
        .optional()
        .isIn(Object.values(TASK_PRIORITY)),
    body("status")
        .optional()
        .isIn(Object.values(TASK_STATUS)),
    body("dueDate")
        .optional()
        .isISO8601()
];

module.exports = {
    addTaskByManagerValidator,
    updateTaskByManagerValidator,
    validateMongoId
};
