const express = require('express');
const authController = require("../controllers/auth.controller");
const { requireAuth, authorize } = require("../middlewares/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { loginLimiter } = require('../middlewares/rateLimit.middleware');
const { loginValidator } = require('../validation/auth.validation');
const validate = require('../middlewares/validation.middleware');

const router = express.Router();

// TODO: Add auth routes here
// Example:

router.post('/login',
    [
        loginLimiter,
        ...loginValidator,
        validate
    ],
    asyncHandler(authController.login)
);

router.post('/logout',
    asyncHandler(authController.logout)
);

module.exports = router;

