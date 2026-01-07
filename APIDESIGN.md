# Task Management System API Design

This document outlines the API endpoints for the Task Management System based on the Postman collection.

**Base URL**: `http://localhost:5000`

## Authentication

### Login
*   **Method**: `POST`
*   **URL**: `/api/auth/login`
*   **Description**: Authenticates a user and sets `accessToken` and `refreshToken` cookies.
*   **Body** (JSON):
    ```json
    {
      "email": "manager@example.com",
      "password": "P@ssw0rd123"
    }
    ```

### Logout
*   **Method**: `POST`
*   **URL**: `/api/auth/logout`
*   **Description**: Logs out the user.

---

## Users

### Add User (Manager only)
*   **Method**: `POST`
*   **URL**: `/api/users`
*   **Body** (JSON):
    ```json
    {
      "name": "New Member",
      "email": "member@example.com",
      "password": "P@ssw0rd123"
    }
    ```

### Get All Users
*   **Method**: `GET`
*   **URL**: `/api/users/getAll`

### Get User By Id
*   **Method**: `GET`
*   **URL**: `/api/users/userById/:userId`

### Update User
*   **Method**: `PUT`
*   **URL**: `/api/users/update/:userId`
*   **Body** (JSON):
    ```json
    {
      "name": "Updated Name",
      "email": "updated@example.com"
    }
    ```

### Delete User
*   **Method**: `DELETE`
*   **URL**: `/api/users/deleteUser/:userId`

---

## Projects

### Create Project (Manager only)
*   **Method**: `POST`
*   **URL**: `/api/projects`
*   **Body** (JSON):
    ```json
    {
      "name": "New Project",
      "description": "Project Description",
      "startDate": "2026-01-01",
      "endDate": "2026-03-01",
      "status": "active",
      "progress": 0
    }
    ```

### Get All Projects
*   **Method**: `GET`
*   **URL**: `/api/projects`
*   **Query Parameters**:
    *   `memberId`: Filter by member ID (optional)

### Get Project By Id
*   **Method**: `GET`
*   **URL**: `/api/projects/:projectId`

### Update Project (Manager only)
*   **Method**: `PUT`
*   **URL**: `/api/projects/:projectId`
*   **Body** (JSON):
    ```json
    {
      "name": "Updated Project",
      "description": "Updated Description",
      "startDate": "2026-01-05",
      "endDate": "2026-04-01",
      "status": "active",
      "progress": 20
    }
    ```

### Delete Project (Manager only)
*   **Method**: `DELETE`
*   **URL**: `/api/projects/:projectId`

### Add Members (Manager only)
*   **Method**: `POST`
*   **URL**: `/api/projects/:projectId/members`
*   **Body** (JSON):
    ```json
    {
      "memberIds": [
        "memberId1",
        "memberId2"
      ]
    }
    ```

### Remove Member (Manager only)
*   **Method**: `DELETE`
*   **URL**: `/api/projects/:projectId/members/:memberId`

---

## Tasks

### Get All Tasks
*   **Method**: `GET`
*   **URL**: `/api/tasks`
*   **Query Parameters**:
    *   `status`: e.g., "pending"
    *   `priority`: e.g., "medium"
    *   `project`: Project ID
    *   `assignedTo`: User ID

### Get Task By Id
*   **Method**: `GET`
*   **URL**: `/api/tasks/:taskId`

### Create Task (Manager only)
*   **Method**: `POST`
*   **URL**: `/api/tasks`
*   **Body** (JSON):
    ```json
    {
      "title": "New Task",
      "description": "Task Details",
      "project": "projectId",
      "assignedTo": "userId",
      "dueDate": "2026-02-01",
      "priority": "medium",
      "status": "pending"
    }
    ```

### Update Task
*   **Method**: `PUT`
*   **URL**: `/api/tasks/:taskId`
*   **Body** (JSON):
    ```json
    {
      "title": "Updated Task",
      "dueDate": "2026-02-15",
      "priority": "high",
      "status": "in_progress"
    }
    ```

### Delete Task (Manager only)
*   **Method**: `DELETE`
*   **URL**: `/api/tasks/:taskId`

---

## Notes

### Get All Notes
*   **Method**: `GET`
*   **URL**: `/api/notes`
*   **Query Parameters**:
    *   `task`: Task ID

### Create Note
*   **Method**: `POST`
*   **URL**: `/api/notes`
*   **Body** (JSON):
    ```json
    {
      "content": "Important Note",
      "task": "taskId",
      "isImportant": true
    }
    ```

### Get Note By Id
*   **Method**: `GET`
*   **URL**: `/api/notes/:noteId`

### Update Note
*   **Method**: `PUT`
*   **URL**: `/api/notes/:noteId`
*   **Body** (JSON):
    ```json
    {
      "content": "Updated Note Content",
      "isImportant": false
    }
    ```

### Delete Note
*   **Method**: `DELETE`
*   **URL**: `/api/notes/:noteId`
