const ActivityLog = require("../models/ActivityLog");
const asyncHandler = require("../utils/asyncHandler");
const { USER_ROLES } = require("../utils/constants");

class ActivityLogController {
  getActivityLogs = asyncHandler(async (req, res) => {
    if (req.user.role !== USER_ROLES.MANAGER) {
      const err = new Error("Forbidden");
      err.statusCode = 403;
      throw err;
    }

    const {
      page = 1,
      limit = 20,
      userId,
      action,
      entityType,
      entityId,
      from,
      to,
      q,
    } = req.query;

    const filter = {};
    if (userId) filter.user = userId;
    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = entityId;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    if (q) {
      filter.$or = [
        { action: new RegExp(q, "i") },
        { entityType: new RegExp(q, "i") },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10), 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10), 1), 200);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      ActivityLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      data: items,
    });
  });
}

module.exports = new ActivityLogController();
