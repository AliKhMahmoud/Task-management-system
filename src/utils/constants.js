
// User Roles 
const USER_ROLES = {
    MANAGER: 'Manager',
    TEAM_MEMBER: 'Team Member',
};

// Task Status 
const TASK_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    ON_HOLD: 'on_hold',
};

// Task Priority 
const TASK_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
};

// Activity Types 
const ACTIVITY_TYPES = {
    LOGIN: 'login',
    LOGOUT: 'logout',
    PROJECT_CREATED: 'project_created',
    PROJECT_UPDATED: 'project_updated',
    PROJECT_DELETED: 'project_deleted',
    TASK_CREATED: 'task_created',
    TASK_UPDATED: 'task_updated',
    TASK_DELETED: 'task_deleted',
    TASK_STATUS_CHANGED: 'task_status_changed',
    NOTE_ADDED: 'note_added',
    NOTE_UPDATED: 'note_updated',
    NOTE_DELETED: 'note_deleted',
    USER_CREATED: 'user_created',
    USER_UPDATED: 'user_updated',
    PASSWORD_RESET_REQUESTED: 'password_reset_requested',
    PASSWORD_RESET: 'password_reset',
};

// HTTP Status Codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
};

// Validation Messages 
const VALIDATION_MESSAGES = {
    REQUIRED: 'هذا الحقل مطلوب',
    INVALID_EMAIL: 'البريد الإلكتروني غير صحيح',
    INVALID_PASSWORD: 'كلمة المرور غير صحيحة',
    PASSWORD_TOO_SHORT: 'كلمة المرور قصيرة جداً',
    INVALID_ROLE: 'الدور غير صحيح',
    INVALID_STATUS: 'الحالة غير صحيحة',
    INVALID_PRIORITY: 'الأولوية غير صحيحة',
    INVALID_DATE: 'التاريخ غير صحيح',
    INVALID_OBJECT_ID: 'معرف غير صحيح',
};

module.exports = {
    USER_ROLES,
    TASK_STATUS,
    TASK_PRIORITY,
    ACTIVITY_TYPES,
    HTTP_STATUS,
    VALIDATION_MESSAGES,
};

