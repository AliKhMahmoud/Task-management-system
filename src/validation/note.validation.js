const { body, param } = require("express-validator");
const mongoose = require("mongoose");

const validateMongoId = (field) => {
    return param(field).custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error(`Invalid ${field}`);
        }
        return true;
    });
};

const createNoteValidator = [
    body("content")
        .notEmpty()
        .withMessage("Content is required")
        .isString()
        .trim(),
    body("task")
        .notEmpty()
        .withMessage("Task ID is required")
        .isMongoId()
        .withMessage("Invalid Task ID"),
    body("isImportant")
        .optional()
        .isBoolean()
];

const updateNoteValidator = [
    body("content")
        .optional()
        .isString()
        .trim(),
    body("isImportant")
        .optional()
        .isBoolean()
];

module.exports = {
    createNoteValidator,
    updateNoteValidator,
    validateMongoId
};
