# 📋 Task Management System

An integrated task management system with real-time instant notifications.

## Key Features

### Task Management
- Create and assign tasks to employees
- Track task status (in progress, completed, pending)
- Set priorities and deadlines
- Add notes and details to tasks
- Manage teams and projects

### Real-time Notification System
- Instant notifications for new task assignments
- Alerts for task status changes
- Notifications for important notes
- Store notifications in the database
- Full RTL Arabic interface

### User Management
- Secure authentication system
- User roles (manager, team member)
- Track user activity
- Multi-level permissions

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time notifications
- **JWT** - Authentication and security
- **bcryptjs** - Password hashing


## Installation and Setup

### Prerequisites
- Node.js (v18 or later)
- MongoDB (local or Atlas)
- npm

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd Task-management-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Copy the configuration file
cp .env

# Edit the file with your specific settings
``` ```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
```

4. **Start the Database**
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas
# Make sure to add your IP to the whitelist
```

5. **Start the Server**
```bash
# Development mode
npm run dev


```



```

### Features
- Interactive notification icon
- Unread notification counter
- Collapsible notification panel
- Simulation buttons for testing

- Full notification history

## API Endpoints

### Authentication
```
POST /api/auth/register     - Register a new user
POST /api/auth/login        - Log in
POST /api/auth/logout       - Log out
```

### Tasks
```
GET    /api/tasks           - Get all tasks
POST   /api/tasks           - Create a new task
GET    /api/tasks/:id       - Get a specific task
PATCH  /api/tasks/:id       - Update a task
DELETE /api/tasks/:id       - Delete a task
```

### Notes
```
GET    /api/notes           - Get all notes
POST   /api/notes           - Add a new note
GET    /api/notes/:id       - Get a specific note
DELETE /api/notes/:id       - Delete a note
```

### Notifications
```
GET    /api/notifications           - Get notifications
GET    /api/notifications/unread-count - Get the number of unread notifications
PATCH  /api/notifications/:id/read  - Mark a notification as read
PATCH  /api/notifications/mark-all-read - Mark all notifications as read
``` Projects
```
GET    /api/projects         - Get all projects
POST   /api/projects         - Create a new project
GET    /api/projects/:id     - Get a specific project
PATCH  /api/projects/:id     - Update a project
DELETE /api/projects/:id     - Delete a project
```

## Usage Scenarios

### 1. Project Manager
- Create projects and tasks
- Assign tasks to team members
- Monitor work progress
- Receive notifications of important changes

### 2. Team Member
- View assigned tasks
- Update task status
- Add notes and details
- Receive notifications of new tasks

### 3. Real-time Notifications
- **New Task Assignment**: Member receives an instant notification
- **Status Change**: Manager receives a notification when the status changes
- **Important Note**: Manager receives a notification when an important note is added

## Project Structure

```
Task-management-system/
├── src/
│   ├── controllers/         # Controller logic
│   │   ├── activity.controller.js
│   │   ├── auth.controller.js
│   │   ├── task.controller.js
│   │   ├── notes.controller.js
│   │   ├── notifications.controller.js
│   │   ├── projects.controller.js
│   │   ├── users.controller.js
│   │   └── ...
│   ├── models/              # Data models
│   │   ├── User.js
│   │   ├── Task.js
│   │   ├── Note.js
│   │   ├── Notification.js
│   │   ├── project.js
│   │   ├── activityLog.js
│   │   └── ...
│   ├── routes/              # Routes
│   │   ├── activityLogs.route.js
│   │   ├── auth.route.js
│   │   ├── notes.route.js
│   │   ├── tasks.route.js
│   │   ├── projects.route.js
│   │   ├── users.route.js
│   │   ├── notifications.route.js
│   │   └── ...
│   ├── services/            # Services
│   │   └── notification.service.js
│   ├── middlewares/         # Middleware
│   │   ├── activityLogs.middleware.js
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── notFound.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── xss.middleware.js
│   │   └── ...
│   ├── utils/               # Utility functions
│   │   ├── socket.js
│   │   ├── asyncHandler.js
│   │   └── ...
│   └── app.js               # Application setup
├──
``` 
│   
├── docs/                    # Documentation
├── .env                     # Environment variables
├── package.json             # Project information
└── README.md               # This file
```

### Notification Types
```javascript
const NOTIFICATION_TYPES = {
NEW_TASK_ASSIGNED: 'NEW_TASK_ASSIGNED',
TASK_REASSIGNED: 'TASK_REASSIGNED',
TASK_STATUS_UPDATED: 'TASK_STATUS_UPDATED',
IMPORTANT
}
```