const express = require("express");
const router = express.Router();

const activityLogController = require("../controllers/activityLogs.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.get("/", requireAuth, activityLogController.getActivityLogs);

module.exports = router;
