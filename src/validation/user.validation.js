const { body, param, query } = require("express-validator");
const { USER_ROLES } = require("../utils/constants");

const addUserValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3 })
        .withMessage("Name must be at least 3 characters long"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),

    body("role")
        .optional()
        .isIn(Object.values(USER_ROLES))
        .withMessage("Invalid user role")
];

const paginationValidator = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

const updateUserValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid User ID format"),

    body("name")
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage("Name must be at least 3 characters long"),

    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),

    body("role")
        .optional()
        .isIn(Object.values(USER_ROLES))
        .withMessage("Invalid user role")
];


module.exports = {
    addUserValidator,
    paginationValidator,
    updateUserValidator
}
