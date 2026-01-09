const ActivityLog = require("../models/ActivityLog");
const asyncHandler = require("../utils/asyncHandler");

const activityLog = asyncHandler(async (req, res, next) => {
  res.logActivity = (payload) => {
    res.locals.__activityLogPayload = payload;
  };

  res.once("finish", () => {
    const payload = res.locals.__activityLogPayload;
    if (!payload) return;

    const statusCode = res.statusCode || 200;
    const success = statusCode >= 200 && statusCode < 400;

    ActivityLog.create({
      user: payload.user || req.user?.id || null,

      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId || null,
      metadata: payload.metadata || {},

      ip: req.ip || "",
      userAgent: req.get("user-agent") || "",
      method: req.method,
      path: req.originalUrl,

      statusCode,
      success,
    }).catch((err) => {
      console.error("[ActivityLog] failed:", err.message);
    });
  });

  next();
});

module.exports = activityLog;
