const express = require('express');
const authController = require("../controllers/auth.controller");
const { requireAuth, authorize } = require("../middlewares/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { apiLimiter, loginLimiter } = require('../middlewares/rateLimit.middleware');

const router = express.Router();

// TODO: Add auth routes here
// Example:

router.post('/login',
    [
        loginLimiter
    ],
    asyncHandler(authController.login)
);

router.post('/logout',
    [
        apiLimiter,
        requireAuth
    ],
    asyncHandler(authController.logout)
);

module.exports = router;

