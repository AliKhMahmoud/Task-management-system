const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    action: {
      type: String,
      required: true,
      enum: [
        // Auth
        "AUTH_LOGIN",

        // Users
        "USER_CREATE",
        "USER_UPDATE",
        "USER_DELETE",

        // Projects
        "PROJECT_CREATE",
        "PROJECT_UPDATE",
        "PROJECT_DELETE",
        "PROJECT_ADD_MEMBER",
        "PROJECT_REMOVE_MEMBER",

        // Tasks
        "TASK_CREATE",
        "TASK_UPDATE",
        "TASK_STATUS_UPDATE",
        "TASK_DELETE",

        // Notes
        "NOTE_CREATE",
        "NOTE_UPDATE",
        "NOTE_DELETE",
      ]
    },

    entityType: { type: String, required: true }, 
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null }, 

    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },

    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    method: { type: String, default: "" },
    path: { type: String, default: "" },

    statusCode: { type: Number, default: 200 },
    success: { type: Boolean, default: true },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

module.exports = ActivityLog;