const { body, query, param} = require("express-validator");


const createProjectByManagerValidator = [
    body("name")
        .trim()
        .notEmpty().withMessage("Project name is required")
        .isLength({ min: 3 }).withMessage("Project name must be at least 3 characters long"),
    
    body("description")
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
    
    body("startDate")
        .notEmpty().withMessage("Start date is required")
        .isISO8601().withMessage("Invalid start date format"),
    
    body("endDate")
        .notEmpty().withMessage("End date is required")
        .isISO8601().withMessage("Invalid end date format")
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.startDate)) {
                throw new Error("End date must be after the start date");
            }
            return true;
        })
];


const getAllProjectsValidator = [
    query("memberId")
        .optional() 
        .isMongoId().withMessage("Invalid Member ID format")
        .trim()
];

const getProjectByIdValidator = [
    param("id")
        .isMongoId().withMessage("The project ID provided is invalid")
];


const updateProjectValidator = [
    param("id").isMongoId().withMessage("Invalid Project ID format"),
    
    body("name").optional().trim().isLength({ min: 3 }),
    body("status").optional().isIn(['active', 'completed', 'on-hold']),
    body("progress").optional().isInt({ min: 0, max: 100 }),
    body("startDate").optional().isISO8601(),
    body("endDate").optional().isISO8601()
];
const deleteProjectValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid project ID format. Please provide a valid MongoDB ID.")
];

const addMemberValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid project ID format"),

    body("memberIds")
        .isArray({ min: 1 })
        .withMessage("memberIds must be an array and cannot be empty"),

    body("memberIds.*")
        .isMongoId()
        .withMessage("Each member ID must be a valid MongoDB ID")
];

const removeMemberValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid project ID format"),

    param("memberId")
        .isMongoId()
        .withMessage("Invalid member ID format. Please check the user ID you want to remove")
];

module.exports = {
    createProjectByManagerValidator,
    getAllProjectsValidator,
    getProjectByIdValidator,
    updateProjectValidator,
    deleteProjectValidator,
    addMemberValidator,
    removeMemberValidator
}