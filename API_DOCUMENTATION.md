# Task Management System - API Documentation

## Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Task Management](#task-management)
- [Tag Management](#tag-management)
- [Sync API](#sync-api)
- [Data Models](#data-models)
- [Advanced Features](#advanced-features)
- [Testing Guide](#testing-guide)
- [Error Handling](#error-handling)
- [Security](#security)

---

## Overview

This is a RESTful API for a Task Management System built with Flask. The API uses JWT-based authentication with access and refresh tokens.

**Features:**
- User authentication with JWT tokens
- Task CRUD operations with soft delete
- Tag-based task categorization
- Advanced filtering, search, and pagination
- Optimistic locking for conflict prevention
- Bulk operations for efficient syncing
- Offline sync support

**Base URL:** `http://localhost:5000/api/v1`

**Tech Stack:**
- Flask 3.1.2
- PostgreSQL (SQLAlchemy 2.0.25)
- JWT Authentication (PyJWT 2.9.0)
- Bcrypt Password Hashing

---

## Getting Started

### Prerequisites
- Python 3.13+
- PostgreSQL
- uv (package manager)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd TaskManagementSoftware-Backend
```

2. **Install dependencies**
```bash
uv pip install -r requirements.txt
```

3. **Configure environment**
Create a `.env` file in the project root:
```bash
# Database
DATABASE_URL=postgresql://tms_user:tms_password@localhost:5432/tms_db
TEST_DATABASE_URL=postgresql://tms_user:tms_password@localhost:5432/tms_test

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-here-min-256-bits
JWT_ACCESS_TOKEN_EXPIRES=900
JWT_REFRESH_TOKEN_EXPIRES=604800
JWT_REFRESH_TOKEN_EXPIRES_LONG=2592000

# Server Configuration
HOST=0.0.0.0
PORT=5000
DEBUG=True
ENV=development

# Security
BCRYPT_LOG_ROUNDS=12
LOGIN_MAX_ATTEMPTS=5
LOGIN_WINDOW_SECONDS=900
LOGIN_BLOCK_DURATION=900

# CORS
CORS_ORIGINS=http://localhost:3000
CORS_SUPPORTS_CREDENTIALS=True
```

4. **Start the server**
```bash
uv run python run.py
```

The database will initialize automatically on first run.

---

## Authentication

This API uses **JWT-based authentication** with two types of tokens:

### Token Types

| Token Type | Lifetime | Storage | Purpose |
|------------|----------|---------|---------|
| **Access Token** | 15 minutes | Client (memory/localStorage) | API authorization |
| **Refresh Token** | 7-30 days | HTTPOnly cookie | Issue new access tokens |

### Authentication Flow

```
1. Register/Login → Receive access token + refresh token (in cookie)
2. Use access token in Authorization header for API requests
3. When access token expires → Use refresh token to get new access token
4. Logout → Revoke refresh token
```

### Using Authentication

**Include access token in requests:**
```http
Authorization: Bearer <access_token>
```

**Refresh token is automatically included via HTTPOnly cookie**

---

## API Endpoints

### Health Check

#### GET /health
Check if the API is running.

**Request:**
```bash
curl http://localhost:5000/api/v1/health
```

**Response: 200 OK**
```json
{
  "status": "healthy"
}
```

---

### Authentication Endpoints

#### POST /auth/register
Create a new user account.

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }' \
  -c cookies.txt
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Validation Rules:**
- `email`: Valid email format, max 255 characters
- `password`: 8-128 characters, must contain uppercase, lowercase, and number
- `name`: 2-100 characters

**Response: 201 Created**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-01-12T10:30:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

**Cookie Set:**
```
Set-Cookie: refresh_token=<token>; Path=/api/v1/auth; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already exists

---

#### POST /auth/login
Authenticate an existing user.

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "rememberMe": true
  }' \
  -c cookies.txt
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": false
}
```

**Parameters:**
- `rememberMe` (optional): If `true`, extends refresh token lifetime to 30 days (default: 7 days)

**Response: 200 OK**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-01-12T10:30:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

**Error Responses:**
- `400 Bad Request`: Missing fields
- `401 Unauthorized`: Invalid credentials
- `429 Too Many Requests`: Rate limit exceeded (5 attempts per 15 minutes)

**Rate Limiting:**
After 5 failed login attempts within 15 minutes, the account is temporarily locked. The response includes a `Retry-After` header indicating when to retry.

---

#### GET /auth/me
Get current authenticated user information.

**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer <access_token>"
```

**Response: 200 OK**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-01-12T10:30:00Z",
    "updatedAt": "2026-01-12T10:30:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid access token
- `404 Not Found`: User not found

---

#### POST /auth/refresh
Get a new access token using refresh token.

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -b cookies.txt \
  -c cookies.txt
```

**Response: 200 OK**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

**Cookie Updated:**
A new refresh token is issued (token rotation for security).

**Error Responses:**
- `401 Unauthorized`: Missing or invalid refresh token
- `403 Forbidden`: Token reuse detected (security breach)

**Security Note:**
If a previously-used refresh token is submitted again, the entire token family is revoked, and the user must log in again.

---

#### POST /auth/logout
Logout and invalidate refresh token.

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -b cookies.txt
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Cookie Cleared:**
```
Set-Cookie: refresh_token=; Path=/api/v1/auth; Max-Age=0
```

---

## Task Management

The Task Management API provides comprehensive endpoints for managing tasks with support for tagging, filtering, pagination, search, and offline synchronization.

**Key Features:**
- **CRUD Operations**: Create, read, update, and delete tasks
- **Soft Delete**: Tasks are marked as deleted rather than permanently removed
- **Tags**: Organize tasks with color-coded tags (many-to-many relationship)
- **Search**: Case-insensitive search across title and description
- **Filtering**: Filter by status, priority, due date, tags, and more
- **Pagination**: Efficient data loading with configurable page sizes
- **Optimistic Locking**: Version-based conflict detection for concurrent updates
- **Bulk Operations**: Process multiple create/update/delete operations in a single request
- **Offline Sync**: Support for offline clients with `clientId`, `tempId`, and `lastSyncedAt`

All task endpoints require authentication via Bearer token.

---

### GET /api/v1/tasks

List all tasks for the authenticated user with optional filtering, search, and pagination.

**Authentication:** Required (Bearer token)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `limit` | integer | No | 50 | Items per page (min: 1, max: 100) |
| `status` | string | No | - | Filter by status: `todo`, `in-progress`, `done` |
| `priority` | string | No | - | Filter by priority: `low`, `medium`, `high`, `urgent` |
| `dueAfter` | string | No | - | Tasks due after this date (YYYY-MM-DD) |
| `dueBefore` | string | No | - | Tasks due before this date (YYYY-MM-DD) |
| `hasNoDueDate` | boolean | No | false | Filter for tasks with no due date |
| `search` | string | No | - | Search in title and description (case-insensitive) |
| `tags` | string | No | - | Comma-separated tag IDs to filter by |
| `isDeleted` | boolean | No | false | Include deleted tasks |
| `lastSyncedAt` | ISO8601 | No | - | Return tasks updated after this timestamp |
| `sortBy` | string | No | "createdAt" | Sort field: `createdAt`, `updatedAt`, `dueDate`, `priority`, `title`, `status` |
| `sortOrder` | string | No | "desc" | Sort direction: `asc` or `desc` |

**Request:**
```bash
# Get all tasks (default sorting: newest first)
curl -X GET http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer <access_token>"

# Filter by status and priority
curl -X GET "http://localhost:5000/api/v1/tasks?status=todo&priority=high" \
  -H "Authorization: Bearer <access_token>"

# Search with pagination
curl -X GET "http://localhost:5000/api/v1/tasks?search=meeting&page=1&limit=20" \
  -H "Authorization: Bearer <access_token>"

# Filter by due date range
curl -X GET "http://localhost:5000/api/v1/tasks?dueAfter=2024-01-01&dueBefore=2024-12-31" \
  -H "Authorization: Bearer <access_token>"
```

**Response: 200 OK**
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "title": "Complete project documentation",
      "description": "Write comprehensive API documentation",
      "status": "in-progress",
      "priority": "high",
      "dueDate": "2024-12-31",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-20T15:30:00Z",
      "isDeleted": false,
      "deletedAt": null,
      "version": 3,
      "lastSyncedAt": null,
      "clientId": "web-app-123",
      "tags": [
        {
          "id": "650e8400-e29b-41d4-a716-446655440001",
          "userId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
          "name": "Work",
          "color": "#FF5733",
          "createdAt": "2024-01-01T10:00:00Z",
          "updatedAt": "2024-01-01T10:00:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3,
    "hasMore": true
  },
  "filters": {
    "applied": ["status: in-progress", "priority: high"]
  },
  "syncMetadata": {
    "latestVersion": 42,
    "serverTime": "2024-01-24T10:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid access token

---

### POST /api/v1/tasks

Create a new task for the authenticated user.

**Authentication:** Required

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New task",
    "description": "Task description here",
    "status": "todo",
    "priority": "medium",
    "dueDate": "2024-12-31",
    "tags": ["650e8400-e29b-41d4-a716-446655440001"],
    "clientId": "mobile-app-456",
    "tempId": "temp-123"
  }'
```

**Request Body:**
```json
{
  "title": "New task",
  "description": "Task description here",
  "status": "todo",
  "priority": "medium",
  "dueDate": "2024-12-31",
  "tags": ["650e8400-e29b-41d4-a716-446655440001"],
  "clientId": "mobile-app-456",
  "tempId": "temp-123"
}
```

**Validation Rules:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | string | Yes | Non-empty, max 255 characters |
| `description` | string | Yes | Non-empty |
| `status` | string | No | Enum: `todo` (default), `in-progress`, `done` |
| `priority` | string | No | Enum: `low`, `medium` (default), `high`, `urgent` |
| `dueDate` | string | No | Format: YYYY-MM-DD |
| `tags` | array | No | Array of valid tag UUIDs (max 20) |
| `clientId` | string | Yes | Non-empty, max 100 characters |
| `tempId` | string | No | Temporary ID for offline sync |

**Response: 201 Created**
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "title": "New task",
    "description": "Task description here",
    "status": "todo",
    "priority": "medium",
    "dueDate": "2024-12-31",
    "createdAt": "2024-01-24T10:00:00Z",
    "updatedAt": "2024-01-24T10:00:00Z",
    "isDeleted": false,
    "deletedAt": null,
    "version": 1,
    "lastSyncedAt": null,
    "clientId": "mobile-app-456",
    "tags": []
  },
  "tempId": "temp-123"
}
```

**Error Responses:**
- `400 Bad Request` (VALIDATION_ERROR): Invalid input data
- `400 Bad Request` (INVALID_TAG): One or more tag IDs are invalid
- `400 Bad Request` (INVALID_REQUEST): Request body is required

---

### GET /api/v1/tasks/<task_id>

Get a specific task by ID.

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `task_id` | UUID | The ID of the task to retrieve |

**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <access_token>"
```

**Response: 200 OK**
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "title": "Task title",
    "description": "Task description",
    "status": "todo",
    "priority": "high",
    "dueDate": "2024-12-31",
    "createdAt": "2024-01-24T10:00:00Z",
    "updatedAt": "2024-01-24T10:00:00Z",
    "isDeleted": false,
    "deletedAt": null,
    "version": 1,
    "lastSyncedAt": null,
    "clientId": "web-app-123",
    "tags": []
  }
}
```

**Error Responses:**
- `404 Not Found` (TASK_NOT_FOUND): Task does not exist
- `403 Forbidden`: Not authorized to access this task

---

### PUT /api/v1/tasks/<task_id>

Perform a full update of a task. All fields must be provided.

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `task_id` | UUID | The ID of the task to update |

**Request:**
```bash
curl -X PUT http://localhost:5000/api/v1/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title",
    "description": "Updated description",
    "status": "in-progress",
    "priority": "high",
    "dueDate": "2024-12-31",
    "tags": [],
    "version": 1,
    "clientId": "web-app-123"
  }'
```

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in-progress",
  "priority": "high",
  "dueDate": "2024-12-31",
  "tags": [],
  "version": 1,
  "clientId": "web-app-123"
}
```

**Note:** The `version` field is required for optimistic locking. It must match the current task version.

**Response: 200 OK** (Success)
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "title": "Updated title",
    "description": "Updated description",
    "status": "in-progress",
    "priority": "high",
    "dueDate": "2024-12-31",
    "createdAt": "2024-01-24T10:00:00Z",
    "updatedAt": "2024-01-24T10:05:00Z",
    "isDeleted": false,
    "deletedAt": null,
    "version": 2,
    "lastSyncedAt": null,
    "clientId": "web-app-123",
    "tags": []
  },
  "conflict": {
    "hasConflict": false
  }
}
```

**Error Responses:**
- `404 Not Found` (TASK_NOT_FOUND): Task does not exist
- `403 Forbidden`: Not authorized to access this task
- `409 Conflict`: Version mismatch - task was modified by another client
- `400 Bad Request` (VALIDATION_ERROR): Invalid input data

---

### PATCH /api/v1/tasks/<task_id>

Perform a partial update of a task. Only modified fields need to be provided.

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `task_id` | UUID | The ID of the task to update |

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/v1/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "done",
    "version": 2,
    "clientId": "web-app-123"
  }'
```

**Request Body:**
```json
{
  "status": "done",
  "version": 2,
  "clientId": "web-app-123"
}
```

**Note:** Only fields present in the request body will be updated. `version` and `clientId` are always required.

**Response: 200 OK**
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "title": "Updated title",
    "description": "Updated description",
    "status": "done",
    "priority": "high",
    "dueDate": "2024-12-31",
    "createdAt": "2024-01-24T10:00:00Z",
    "updatedAt": "2024-01-24T10:10:00Z",
    "isDeleted": false,
    "deletedAt": null,
    "version": 3,
    "lastSyncedAt": null,
    "clientId": "web-app-123",
    "tags": []
  },
  "conflict": {
    "hasConflict": false
  }
}
```

**Error Responses:** Same as PUT endpoint

---

### DELETE /api/v1/tasks/<task_id>

Delete a task (soft delete by default, or permanent delete with `permanent=true`).

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `task_id` | UUID | The ID of the task to delete |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `version` | integer | Yes | - | Current version of the task (for optimistic locking) |
| `permanent` | boolean | No | false | If true, permanently delete; otherwise soft delete |

**Request:**
```bash
# Soft delete (default)
curl -X DELETE "http://localhost:5000/api/v1/tasks/550e8400-e29b-41d4-a716-446655440000?version=3" \
  -H "Authorization: Bearer <access_token>"

# Permanent delete
curl -X DELETE "http://localhost:5000/api/v1/tasks/550e8400-e29b-41d4-a716-446655440000?version=3&permanent=true" \
  -H "Authorization: Bearer <access_token>"
```

**Response: 200 OK** (Soft Delete)
```json
{
  "success": true,
  "deletedAt": "2024-01-24T10:15:00Z",
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "title": "Updated title",
    "description": "Updated description",
    "status": "done",
    "priority": "high",
    "dueDate": "2024-12-31",
    "createdAt": "2024-01-24T10:00:00Z",
    "updatedAt": "2024-01-24T10:15:00Z",
    "isDeleted": true,
    "deletedAt": "2024-01-24T10:15:00Z",
    "version": 4,
    "lastSyncedAt": null,
    "clientId": "web-app-123",
    "tags": []
  }
}
```

**Response: 200 OK** (Permanent Delete)
```json
{
  "success": true,
  "deletedAt": "2024-01-24T10:15:00Z",
  "message": "Task permanently deleted"
}
```

**Error Responses:**
- `404 Not Found` (TASK_NOT_FOUND): Task does not exist
- `403 Forbidden`: Not authorized to access this task
- `409 Conflict`: Version mismatch
- `400 Bad Request`: Invalid version parameter

---

### POST /api/v1/tasks/bulk

Perform bulk operations (create, update, delete) in a single request for efficient syncing.

**Authentication:** Required

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/tasks/bulk \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "mobile-app-456",
    "timestamp": "2024-01-24T10:00:00Z",
    "operations": [
      {
        "type": "create",
        "tempId": "temp-1",
        "data": {
          "title": "Task 1",
          "description": "Description 1",
          "priority": "high"
        }
      },
      {
        "type": "update",
        "taskId": "550e8400-e29b-41d4-a716-446655440000",
        "version": 1,
        "data": {
          "status": "done"
        }
      },
      {
        "type": "delete",
        "taskId": "550e8400-e29b-41d4-a716-446655440001",
        "version": 2
      }
    ]
  }'
```

**Request Body:**
```json
{
  "clientId": "mobile-app-456",
  "timestamp": "2024-01-24T10:00:00Z",
  "operations": [
    {
      "type": "create",
      "tempId": "unique-temp-id",
      "data": {
        "title": "Task Title",
        "description": "Description",
        "status": "todo",
        "priority": "medium",
        "dueDate": "2024-12-31",
        "tags": []
      }
    },
    {
      "type": "update",
      "taskId": "550e8400-e29b-41d4-a716-446655440000",
      "version": 1,
      "data": {
        "status": "done"
      }
    },
    {
      "type": "delete",
      "taskId": "550e8400-e29b-41d4-a716-446655440001",
      "version": 1
    }
  ]
}
```

**Validation Rules:**
- `clientId`: Required, non-empty string, max 100 characters
- `operations`: Array of 1-100 operations
- Each operation must have valid `type` (create, update, delete)
- Update/Delete operations must include `taskId` and `version`
- Create operations must include `data` with required fields

**Response: 200 OK**
```json
{
  "results": [
    {
      "success": true,
      "tempId": "temp-1",
      "taskId": "550e8400-e29b-41d4-a716-446655440002",
      "task": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "userId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "title": "Task 1",
        "description": "Description 1",
        "status": "todo",
        "priority": "high",
        "dueDate": null,
        "createdAt": "2024-01-24T10:00:00Z",
        "updatedAt": "2024-01-24T10:00:00Z",
        "isDeleted": false,
        "deletedAt": null,
        "version": 1,
        "lastSyncedAt": null,
        "clientId": "mobile-app-456",
        "tags": []
      }
    },
    {
      "success": true,
      "taskId": "550e8400-e29b-41d4-a716-446655440000",
      "task": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "userId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "title": "Original Title",
        "description": "Original Description",
        "status": "done",
        "priority": "medium",
        "dueDate": null,
        "createdAt": "2024-01-24T09:00:00Z",
        "updatedAt": "2024-01-24T10:00:00Z",
        "isDeleted": false,
        "deletedAt": null,
        "version": 2,
        "lastSyncedAt": null,
        "clientId": "mobile-app-456",
        "tags": []
      }
    },
    {
      "success": true,
      "taskId": "550e8400-e29b-41d4-a716-446655440001",
      "deletedAt": "2024-01-24T10:00:00Z"
    }
  ],
  "summary": {
    "total": 3,
    "succeeded": 3,
    "failed": 0,
    "conflicts": 0
  }
}
```

**Error Responses:**
- `400 Bad Request` (VALIDATION_ERROR): Missing clientId or invalid operations
- `413 Payload Too Large` (PAYLOAD_TOO_LARGE): More than 100 operations

---

## Tag Management

The Tag Management API provides endpoints for creating and managing tags used to categorize tasks. Tags are color-coded labels with unique names per user.

**Key Features:**
- **CRUD Operations**: Create, read, update, and delete tags
- **Unique Names**: Each user can have only one tag with a given name
- **Color Coding**: Customize tags with hex colors (default: #808080)
- **Pagination & Search**: Efficiently browse and search tags
- **Case-Insensitive Search**: Find tags by name regardless of case
- **Cascade Delete**: Removing a tag automatically removes it from all tasks

All tag endpoints require authentication via Bearer token.

---

### GET /api/v1/tags

List all tags for the authenticated user with optional search and pagination.

**Authentication:** Required (Bearer token)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `limit` | integer | No | 50 | Items per page (min: 1, max: 100) |
| `search` | string | No | - | Search by tag name (case-insensitive) |
| `sortBy` | string | No | "name" | Sort field: `name`, `createdAt`, `updatedAt` |
| `sortOrder` | string | No | "asc" | Sort direction: `asc` or `desc` |

**Request:**
```bash
# Get all tags (default sorting: alphabetical)
curl -X GET http://localhost:5000/api/v1/tags \
  -H "Authorization: Bearer <access_token>"

# Search tags with pagination
curl -X GET "http://localhost:5000/api/v1/tags?search=work&page=1&limit=20" \
  -H "Authorization: Bearer <access_token>"

# Sort by creation date (newest first)
curl -X GET "http://localhost:5000/api/v1/tags?sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer <access_token>"
```

**Response: 200 OK**
```json
{
  "tags": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "userId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "name": "Work",
      "color": "#FF5733",
      "createdAt": "2026-01-24T10:00:00Z",
      "updatedAt": "2026-01-24T10:00:00Z"
    },
    {
      "id": "650e8400-e29b-41d4-a716-446655440002",
      "userId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "name": "Personal",
      "color": "#808080",
      "createdAt": "2026-01-24T10:05:00Z",
      "updatedAt": "2026-01-24T10:05:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 2,
    "totalPages": 1,
    "hasMore": false
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid access token

---

### GET /api/v1/tags/<tag_id>

Get a specific tag by ID.

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `tag_id` | UUID | The ID of the tag to retrieve |

**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/tags/650e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer <access_token>"
```

**Response: 200 OK**
```json
{
  "tag": {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "userId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "name": "Work",
    "color": "#FF5733",
    "createdAt": "2026-01-24T10:00:00Z",
    "updatedAt": "2026-01-24T10:00:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found` (TAG_NOT_FOUND): Tag does not exist
- `403 Forbidden`: Not authorized to access this tag
- `401 Unauthorized`: Missing or invalid access token

---

### POST /api/v1/tags

Create a new tag for the authenticated user.

**Authentication:** Required

**Request:**
```bash
# Create tag with custom color
curl -X POST http://localhost:5000/api/v1/tags \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Work",
    "color": "#FF5733"
  }'

# Create tag with default color
curl -X POST http://localhost:5000/api/v1/tags \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Personal"
  }'
```

**Request Body:**
```json
{
  "name": "Work",
  "color": "#FF5733"
}
```

**Validation Rules:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | Yes | 1-50 characters after trimming, unique per user |
| `color` | string | No | Hex format #RRGGBB (e.g., #FF5733), default #808080 |

**Response: 201 Created**
```json
{
  "tag": {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "userId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "name": "Work",
    "color": "#FF5733",
    "createdAt": "2026-01-24T10:00:00Z",
    "updatedAt": "2026-01-24T10:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` (VALIDATION_ERROR): Invalid input data
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Invalid Input data",
    "details": {
      "fields": {
        "name": "Tag name must be less than 50 characters",
        "color": "Color must be in hex format (#RRGGBB)"
      }
    },
    "timestamp": "2026-01-24T10:00:00Z"
  }
  ```
- `409 Conflict` (TAG_NAME_EXISTS): Tag name already exists
  ```json
  {
    "error": "TAG_NAME_EXISTS",
    "message": "A tag with this name already exists",
    "timestamp": "2026-01-24T10:00:00Z"
  }
  ```
- `400 Bad Request` (INVALID_REQUEST): Request body is required
- `401 Unauthorized`: Missing or invalid access token

---

### PUT /api/v1/tags/<tag_id>

Perform a full update of a tag. Both name and color must be provided.

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `tag_id` | UUID | The ID of the tag to update |

**Request:**
```bash
curl -X PUT http://localhost:5000/api/v1/tags/650e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Work Projects",
    "color": "#00FF00"
  }'
```

**Request Body:**
```json
{
  "name": "Work Projects",
  "color": "#00FF00"
}
```

**Note:** Both `name` and `color` are required for PUT requests.

**Response: 200 OK**
```json
{
  "tag": {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "userId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "name": "Work Projects",
    "color": "#00FF00",
    "createdAt": "2026-01-24T10:00:00Z",
    "updatedAt": "2026-01-24T10:15:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found` (TAG_NOT_FOUND): Tag does not exist
- `403 Forbidden`: Not authorized to access this tag
- `409 Conflict` (TAG_NAME_EXISTS): Updated name conflicts with existing tag
- `400 Bad Request` (VALIDATION_ERROR): Invalid input data or missing required fields
- `401 Unauthorized`: Missing or invalid access token

---

### PATCH /api/v1/tags/<tag_id>

Perform a partial update of a tag. Only modified fields need to be provided.

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `tag_id` | UUID | The ID of the tag to update |

**Request:**
```bash
# Update only the color
curl -X PATCH http://localhost:5000/api/v1/tags/650e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "color": "#0000FF"
  }'

# Update only the name
curl -X PATCH http://localhost:5000/api/v1/tags/650e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Work - Updated"
  }'
```

**Request Body:**
```json
{
  "color": "#0000FF"
}
```

**Note:** Provide only the fields you want to update. At least one field must be present.

**Response: 200 OK**
```json
{
  "tag": {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "userId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "name": "Work Projects",
    "color": "#0000FF",
    "createdAt": "2026-01-24T10:00:00Z",
    "updatedAt": "2026-01-24T10:20:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found` (TAG_NOT_FOUND): Tag does not exist
- `403 Forbidden`: Not authorized to access this tag
- `409 Conflict` (TAG_NAME_EXISTS): Updated name conflicts with existing tag
- `400 Bad Request` (VALIDATION_ERROR): Invalid input data
- `401 Unauthorized`: Missing or invalid access token

---

### DELETE /api/v1/tags/<tag_id>

Delete a tag permanently. This will automatically remove the tag from all tasks (cascade delete).

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `tag_id` | UUID | The ID of the tag to delete |

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/v1/tags/650e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer <access_token>"
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Tag deleted successfully",
  "deletedAt": "2026-01-24T10:25:00Z"
}
```

**Note:** Deleting a tag automatically removes it from all tasks that use it. This is handled by database cascade delete on the `task_tags` join table.

**Error Responses:**
- `404 Not Found` (TAG_NOT_FOUND): Tag does not exist
  ```json
  {
    "error": "TAG_NOT_FOUND",
    "message": "Tag not found: 650e8400-e29b-41d4-a716-446655440001",
    "timestamp": "2026-01-24T10:00:00Z"
  }
  ```
- `403 Forbidden`: Not authorized to access this tag
- `401 Unauthorized`: Missing or invalid access token

---

## Sync API

The Sync API provides endpoints for offline-first synchronization, enabling clients to work offline and sync changes when connectivity is restored.

**Key Features:**
- **Push Operations**: Upload local changes (create/update/delete) to the server
- **Pull Changes**: Download changes from the server since last sync
- **Conflict Detection**: Optimistic locking with version-based conflict detection
- **Conflict Resolution**: Manual resolution strategies (use-local, use-remote, merge)
- **Idempotency**: Operation IDs prevent duplicate processing on retries
- **Client Exclusion**: Pull excludes changes made by the requesting client

All sync endpoints require authentication via Bearer token.

---

### POST /api/v1/sync/push

Upload local changes (batch operations) to the server.

**Authentication:** Required (Bearer token)

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/sync/push \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "mobile-app-456",
    "operations": [
      {
        "id": "op-uuid-1",
        "type": "create",
        "entity": "task",
        "tempId": "temp-123",
        "payload": {
          "title": "New Task",
          "description": "Task description",
          "status": "todo",
          "priority": "medium"
        }
      },
      {
        "id": "op-uuid-2",
        "type": "update",
        "entity": "task",
        "entityId": "550e8400-e29b-41d4-a716-446655440000",
        "version": 2,
        "payload": {
          "status": "done"
        }
      },
      {
        "id": "op-uuid-3",
        "type": "delete",
        "entity": "tag",
        "entityId": "650e8400-e29b-41d4-a716-446655440001",
        "version": 1
      }
    ]
  }'
```

**Request Body:**
```json
{
  "clientId": "mobile-app-456",
  "operations": [
    {
      "id": "op-uuid-1",
      "type": "create",
      "entity": "task",
      "tempId": "temp-123",
      "payload": {
        "title": "Task Title",
        "description": "Description",
        "status": "todo",
        "priority": "medium"
      }
    },
    {
      "id": "op-uuid-2",
      "type": "update",
      "entity": "task",
      "entityId": "550e8400-e29b-41d4-a716-446655440000",
      "version": 2,
      "payload": {
        "status": "done"
      }
    },
    {
      "id": "op-uuid-3",
      "type": "delete",
      "entity": "tag",
      "entityId": "650e8400-e29b-41d4-a716-446655440001",
      "version": 1
    }
  ]
}
```

**Operation Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | No | Unique operation ID for idempotency |
| `type` | string | Yes | Operation type: `create`, `update`, `delete` |
| `entity` | string | Yes | Entity type: `task`, `tag` |
| `entityId` | UUID | For update/delete | Server-assigned entity ID |
| `tempId` | string | For create | Client-assigned temporary ID |
| `version` | integer | For update/delete | Current entity version |
| `payload` | object | For create/update | Entity data |

**Validation Rules:**
- `clientId`: Required, max 100 characters
- `operations`: Required, max 100 operations per request
- `type`: Must be one of: `create`, `update`, `delete`
- `entity`: Must be one of: `task`, `tag`

**Response: 200 OK**
```json
{
  "accepted": [
    {
      "operationId": "op-uuid-1",
      "entityId": "750e8400-e29b-41d4-a716-446655440002",
      "tempId": "temp-123",
      "entity": {
        "id": "750e8400-e29b-41d4-a716-446655440002",
        "title": "New Task",
        "status": "todo",
        "version": 1
      },
      "version": 1
    }
  ],
  "rejected": [
    {
      "operationId": "op-uuid-2",
      "reason": "CONFLICT",
      "error": "Version conflict",
      "serverVersion": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "status": "in-progress",
        "version": 3
      }
    }
  ],
  "conflicts": [
    {
      "entityType": "task",
      "entityId": "550e8400-e29b-41d4-a716-446655440000",
      "serverVersion": {"status": "in-progress", "version": 3},
      "clientVersion": {"status": "done", "version": 2},
      "conflictFields": ["status"],
      "message": "Task modified by another client"
    }
  ],
  "idMapping": {
    "temp-123": "750e8400-e29b-41d4-a716-446655440002"
  },
  "summary": {
    "total": 3,
    "accepted": 2,
    "rejected": 1,
    "conflicts": 1
  },
  "serverTime": "2026-01-26T10:00:00Z",
  "syncedAt": "2026-01-26T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` (SYNC_VALIDATION_ERROR): Invalid input data
- `413 Payload Too Large`: More than 100 operations

---

### POST /api/v1/sync/pull

Download changes from the server since last sync.

**Authentication:** Required (Bearer token)

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/sync/pull \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "mobile-app-456",
    "lastSyncedAt": "2026-01-25T10:00:00Z",
    "entities": ["task", "tag"],
    "limit": 100
  }'
```

**Request Body:**
```json
{
  "clientId": "mobile-app-456",
  "lastSyncedAt": "2026-01-25T10:00:00Z",
  "entities": ["task", "tag"],
  "limit": 100
}
```

**Request Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `clientId` | string | Yes | - | Client device identifier |
| `lastSyncedAt` | ISO8601 | No | null | Get changes after this timestamp |
| `entities` | array | No | ["task", "tag"] | Entity types to include |
| `limit` | integer | No | 100 | Max items to return (max 500) |

**Response: 200 OK**
```json
{
  "changes": {
    "tasks": [
      {
        "type": "update",
        "entity": "task",
        "data": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "title": "Updated Task",
          "status": "in-progress",
          "version": 3,
          "updatedAt": "2026-01-25T15:30:00Z"
        },
        "changedBy": "web-app-123",
        "timestamp": "2026-01-25T15:30:00Z"
      }
    ],
    "tags": [
      {
        "type": "create",
        "entity": "tag",
        "data": {
          "id": "650e8400-e29b-41d4-a716-446655440003",
          "name": "New Tag",
          "color": "#FF5733",
          "version": 1
        },
        "changedBy": "web-app-123",
        "timestamp": "2026-01-25T14:00:00Z"
      }
    ]
  },
  "deletions": {
    "tasks": [
      {
        "entityType": "task",
        "entityId": "550e8400-e29b-41d4-a716-446655440001",
        "deletedAt": "2026-01-25T16:00:00Z"
      }
    ],
    "tags": []
  },
  "metadata": {
    "serverTime": "2026-01-26T10:00:00Z",
    "hasMore": false,
    "changeCount": 3,
    "oldestChange": "2026-01-25T14:00:00Z",
    "newestChange": "2026-01-25T16:00:00Z"
  },
  "syncedAt": "2026-01-26T10:00:00Z"
}
```

**Note:** Changes made by the requesting `clientId` are excluded from the results to prevent echoing back the client's own changes.

**Error Responses:**
- `400 Bad Request` (SYNC_VALIDATION_ERROR): Invalid input data

---

### GET /api/v1/sync/status

Check sync status and pending changes count.

**Authentication:** Required (Bearer token)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clientId` | string | Yes | Client device identifier |
| `lastSyncedAt` | ISO8601 | No | Last sync timestamp |

**Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/sync/status?clientId=mobile-app-456&lastSyncedAt=2026-01-25T10:00:00Z" \
  -H "Authorization: Bearer <access_token>"
```

**Response: 200 OK**
```json
{
  "lastSyncedAt": "2026-01-25T10:00:00Z",
  "serverTime": "2026-01-26T10:00:00Z",
  "pendingChanges": {
    "tasks": 5,
    "tags": 2,
    "total": 7
  },
  "clientInfo": {
    "clientId": "mobile-app-456",
    "lastSeen": "2026-01-26T10:00:00Z"
  },
  "syncHealth": "behind",
  "needsSync": true
}
```

**Sync Health States:**

| State | Description |
|-------|-------------|
| `healthy` | <= 100 pending changes, synced within 24 hours |
| `behind` | > 100 pending changes or last sync > 24 hours ago |
| `stale` | > 1000 pending changes or last sync > 7 days ago |

**Error Responses:**
- `400 Bad Request`: Missing clientId parameter

---

### POST /api/v1/sync/resolve

Submit conflict resolution decision.

**Authentication:** Required (Bearer token)

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/sync/resolve \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "mobile-app-456",
    "entityType": "task",
    "entityId": "550e8400-e29b-41d4-a716-446655440000",
    "resolution": "merge",
    "localVersion": {
      "status": "done",
      "priority": "high"
    },
    "mergedData": {
      "status": "done",
      "title": "Merged Title from Server"
    }
  }'
```

**Request Body:**
```json
{
  "clientId": "mobile-app-456",
  "entityType": "task",
  "entityId": "550e8400-e29b-41d4-a716-446655440000",
  "resolution": "use-local",
  "localVersion": {
    "status": "done",
    "priority": "high"
  }
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clientId` | string | Yes | Client device identifier |
| `entityType` | string | Yes | Entity type: `task`, `tag` |
| `entityId` | UUID | Yes | Entity to resolve |
| `resolution` | string | Yes | Strategy: `use-local`, `use-remote`, `merge` |
| `localVersion` | object | For use-local | Client's version data |
| `mergedData` | object | For merge | Merged data to apply |

**Resolution Strategies:**

| Strategy | Description |
|----------|-------------|
| `use-local` | Replace server data with client's version |
| `use-remote` | Keep server's current version (no change) |
| `merge` | Apply custom merged data |

**Response: 200 OK**
```json
{
  "success": true,
  "entity": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Merged Title from Server",
    "status": "done",
    "version": 4,
    "updatedAt": "2026-01-26T10:05:00Z"
  },
  "version": 4,
  "message": "Applied merged version"
}
```

**Error Responses:**
- `400 Bad Request` (SYNC_VALIDATION_ERROR): Invalid input or missing required fields
- `404 Not Found`: Entity not found
- `409 Conflict`: New conflict exists (entity was modified again)

---

### POST /api/v1/sync/full

Perform full bidirectional sync (push + pull in single atomic request).

**Authentication:** Required (Bearer token)

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/sync/full \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "mobile-app-456",
    "lastSyncedAt": "2026-01-25T10:00:00Z",
    "push": {
      "operations": [
        {
          "id": "op-1",
          "type": "create",
          "entity": "task",
          "tempId": "temp-1",
          "payload": {
            "title": "Offline Task",
            "description": "Created while offline"
          }
        }
      ]
    },
    "pull": {
      "entities": ["task", "tag"],
      "limit": 100
    }
  }'
```

**Request Body:**
```json
{
  "clientId": "mobile-app-456",
  "lastSyncedAt": "2026-01-25T10:00:00Z",
  "push": {
    "operations": []
  },
  "pull": {
    "entities": ["task", "tag"],
    "limit": 100
  }
}
```

**Response: 200 OK**
```json
{
  "push": {
    "accepted": [...],
    "rejected": [...],
    "conflicts": [...],
    "idMapping": {...},
    "summary": {
      "total": 1,
      "accepted": 1,
      "rejected": 0,
      "conflicts": 0
    }
  },
  "pull": {
    "changes": {
      "tasks": [...],
      "tags": [...]
    },
    "deletions": {
      "tasks": [],
      "tags": []
    },
    "metadata": {
      "serverTime": "2026-01-26T10:00:00Z",
      "hasMore": false,
      "changeCount": 5
    }
  },
  "syncCompleted": true,
  "serverTime": "2026-01-26T10:00:00Z",
  "syncedAt": "2026-01-26T10:00:00Z"
}
```

**Behavior:**
- Push operations are executed first
- Pull is executed after push completes
- Pull excludes changes just pushed by this client
- Both results are returned in a single response

**Error Responses:**
- `400 Bad Request` (SYNC_VALIDATION_ERROR): Invalid input data
- `413 Payload Too Large`: More than 100 push operations

---

### Sync Workflow Example

This example demonstrates a complete offline sync workflow.

**1. Check sync status**
```bash
curl -X GET "http://localhost:5000/api/v1/sync/status?clientId=mobile-app-456&lastSyncedAt=2026-01-25T10:00:00Z" \
  -H "Authorization: Bearer $TOKEN"
```

**2. Push offline changes**
```bash
curl -X POST http://localhost:5000/api/v1/sync/push \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "mobile-app-456",
    "operations": [
      {
        "id": "op-offline-1",
        "type": "create",
        "entity": "task",
        "tempId": "offline-task-1",
        "payload": {
          "title": "Task created offline",
          "description": "Will sync when online"
        }
      }
    ]
  }'
```

**3. Handle conflicts (if any)**
```bash
curl -X POST http://localhost:5000/api/v1/sync/resolve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "mobile-app-456",
    "entityType": "task",
    "entityId": "550e8400-e29b-41d4-a716-446655440000",
    "resolution": "use-local",
    "localVersion": {"status": "done"}
  }'
```

**4. Pull remote changes**
```bash
curl -X POST http://localhost:5000/api/v1/sync/pull \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "mobile-app-456",
    "lastSyncedAt": "2026-01-25T10:00:00Z"
  }'
```

**5. Or use full sync for everything at once**
```bash
curl -X POST http://localhost:5000/api/v1/sync/full \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "mobile-app-456",
    "lastSyncedAt": "2026-01-25T10:00:00Z",
    "push": {"operations": [...]},
    "pull": {"entities": ["task", "tag"]}
  }'
```

---

## Data Models

### Task Model

The Task model represents a task in the system with full support for versioning, soft delete, and tagging.

**Fields:**

| Field | Type | Nullable | Default | Constraints |
|-------|------|----------|---------|-------------|
| `id` | UUID | No | auto-generated | Primary key |
| `userId` | UUID | No | - | Foreign key to User (CASCADE delete) |
| `title` | string | No | - | Max 255 chars, non-empty (trimmed) |
| `description` | string | No | - | Non-empty (trimmed) |
| `status` | string | No | 'todo' | Enum: `todo`, `in-progress`, `done` |
| `priority` | string | No | 'medium' | Enum: `low`, `medium`, `high`, `urgent` |
| `dueDate` | date | Yes | null | Format: YYYY-MM-DD |
| `createdAt` | datetime | No | current time | ISO 8601 format with timezone |
| `updatedAt` | datetime | No | current time | Updated automatically on modification |
| `isDeleted` | boolean | No | false | Soft delete flag |
| `deletedAt` | datetime | Yes | null | Populated on soft delete |
| `version` | integer | No | 1 | Incremented on each update for optimistic locking |
| `lastSyncedAt` | datetime | Yes | null | Sync tracking for offline clients |
| `clientId` | string | No | - | Max 100 chars, identifies the source client |

**Relationships:**
- **User**: Many-to-One relationship (many tasks belong to one user)
- **Tags**: Many-to-Many relationship through TaskTag join table

**Constraints:**
- `status` must be one of: 'todo', 'in-progress', 'done'
- `priority` must be one of: 'low', 'medium', 'high', 'urgent'
- `title` must be non-empty after trimming whitespace

**Database Indexes:**
- `idx_tasks_user_active`: (userId, isDeleted) - for querying active tasks
- `idx_tasks_status`: (status) - for filtering by status
- `idx_tasks_priority`: (priority) - for filtering by priority
- `idx_tasks_due_date`: (dueDate) - for due date queries
- `idx_tasks_created`: (createdAt) - for sorting by creation date
- `idx_tasks_updated`: (updatedAt) - for sync operations
- `idx_tasks_user_status`: (userId, status, updatedAt) - composite for common queries
- `idx_tasks_user_sync`: (userId, updatedAt, isDeleted) - for offline sync

---

### Tag Model

Tags allow users to categorize and organize their tasks with color-coded labels. Tags support offline sync with soft delete capability.

**Fields:**

| Field | Type | Nullable | Default | Constraints |
|-------|------|----------|---------|-------------|
| `id` | UUID | No | auto-generated | Primary key |
| `userId` | UUID | No | - | Foreign key to User (CASCADE delete) |
| `name` | string | No | - | Max 50 characters |
| `color` | string | No | '#808080' | Hex color code (7 chars including #) |
| `createdAt` | datetime | No | current time | ISO 8601 format with timezone |
| `updatedAt` | datetime | No | current time | Updated automatically on modification |
| `version` | integer | No | 1 | Incremented on each update for optimistic locking |
| `lastSyncedAt` | datetime | Yes | null | Sync tracking for offline clients |
| `clientId` | string | Yes | null | Max 100 chars, identifies the source client |
| `isDeleted` | boolean | No | false | Soft delete flag |
| `deletedAt` | datetime | Yes | null | Populated on soft delete |

**Relationships:**
- **User**: Many-to-One relationship (many tags belong to one user)
- **Tasks**: Many-to-Many relationship through TaskTag join table

**Constraints:**
- Unique constraint on (userId, name): Each user can have only one tag with a given name

**Database Indexes:**
- `idx_tags_updated`: (updatedAt) - for sync operations
- `idx_tags_user_sync`: (userId, updatedAt, isDeleted) - for efficient sync queries

---

### TaskTag Join Table

The TaskTag model is a junction table that manages the many-to-many relationship between Tasks and Tags.

**Fields:**

| Field | Type | Constraints |
|-------|------|-------------|
| `taskId` | UUID | Foreign key to Task (CASCADE delete), part of composite primary key |
| `tagId` | UUID | Foreign key to Tag (CASCADE delete), part of composite primary key |

**Purpose:** Allows a task to have multiple tags, and a tag to be assigned to multiple tasks.

---

## Advanced Features

### Pagination

All list endpoints support pagination to efficiently handle large datasets.

**How it works:**
- Use `page` parameter to specify which page to retrieve (default: 1)
- Use `limit` parameter to specify items per page (default: 50, max: 100)
- Response includes `pagination` object with metadata

**Example:**
```bash
# Get second page with 20 items
curl -X GET "http://localhost:5000/api/v1/tasks?page=2&limit=20" \
  -H "Authorization: Bearer <access_token>"
```

**Pagination Response:**
```json
{
  "tasks": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasMore": true
  }
}
```

---

### Filtering and Search

Tasks can be filtered by multiple criteria simultaneously for powerful querying.

**Available Filters:**
- **Status**: Filter by one or more task statuses
- **Priority**: Filter by one or more priority levels
- **Due Date**: Filter by date range (before/after)
- **Tags**: Filter by tag IDs
- **Deleted**: Include or exclude deleted tasks
- **Search**: Case-insensitive text search across title and description

**Example - Multiple Filters:**
```bash
curl -X GET "http://localhost:5000/api/v1/tasks?status=todo&priority=high&search=meeting&dueAfter=2024-01-01" \
  -H "Authorization: Bearer <access_token>"
```

This returns all high-priority, todo tasks containing "meeting" in title or description, due after January 1, 2024.

---

### Optimistic Locking

Optimistic locking prevents data loss from concurrent updates using version numbers.

**How it works:**
1. Each task has a `version` field that starts at 1
2. When updating, the client must provide the current `version`
3. Server checks if the version matches
4. If version matches: update succeeds, version increments
5. If version doesn't match: update fails with 409 Conflict

**Example - Successful Update:**
```bash
# Task currently at version 1
curl -X PATCH http://localhost:5000/api/v1/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "done",
    "version": 1,
    "clientId": "web-app-123"
  }'

# Response: version is now 2
{
  "task": {..., "version": 2},
  "conflict": {"hasConflict": false}
}
```

**Example - Conflict:**
```bash
# Trying to update with outdated version
curl -X PATCH http://localhost:5000/api/v1/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "done",
    "version": 1,
    "clientId": "web-app-123"
  }'

# Response: 409 Conflict
{
  "error": "CONFLICT",
  "message": "Task modified by another client",
  "details": {
    "clientVersion": 1,
    "serverVersion": 3
  }
}
```

---

### Offline Sync

The API supports offline-first clients with several features designed for sync:

**Key Fields for Sync:**
- **clientId**: Identifies which client made the change
- **tempId**: Temporary ID for offline-created tasks
- **version**: Detects conflicts
- **lastSyncedAt**: Query parameter to get changes since last sync

**Offline Create Pattern:**
```json
{
  "title": "Offline Task",
  "description": "Created while offline",
  "clientId": "mobile-app-456",
  "tempId": "offline-temp-123"
}
```

**Response maps tempId to server ID:**
```json
{
  "task": {"id": "550e8400-...", ...},
  "tempId": "offline-temp-123"
}
```

**Sync Pattern - Get Changes:**
```bash
# Get all tasks updated since last sync
curl -X GET "http://localhost:5000/api/v1/tasks?lastSyncedAt=2024-01-24T09:00:00Z" \
  -H "Authorization: Bearer <access_token>"
```

---

### Bulk Operations

Process multiple operations in a single request for efficient syncing.

**Benefits:**
- Reduces network roundtrips
- Atomic processing (all or nothing per operation)
- Returns individual results for each operation

**Supported Operations:**
- **create**: Create new tasks
- **update**: Update existing tasks (partial update)
- **delete**: Delete tasks (soft delete)

**Example:**
```bash
curl -X POST http://localhost:5000/api/v1/tasks/bulk \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "mobile-app-456",
    "operations": [
      {"type": "create", "tempId": "t1", "data": {"title": "Task 1", "description": "Desc 1"}},
      {"type": "update", "taskId": "550e8400-...", "version": 1, "data": {"status": "done"}},
      {"type": "delete", "taskId": "650e8400-...", "version": 2}
    ]
  }'
```

**Response:**
```json
{
  "results": [
    {"success": true, "tempId": "t1", "taskId": "750e8400-...", "task": {...}},
    {"success": true, "taskId": "550e8400-...", "task": {...}},
    {"success": true, "taskId": "650e8400-...", "deletedAt": "2024-01-24T10:00:00Z"}
  ],
  "summary": {"total": 3, "succeeded": 3, "failed": 0, "conflicts": 0}
}
```

---

## Testing Guide

### Manual Testing with cURL

#### Complete Authentication Flow

**1. Register a new user**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "name": "Test User"
  }' \
  -c cookies.txt -v
```

**2. Save the access token**
Copy the `accessToken` from the response.

**3. Test protected endpoint**
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**4. Refresh the access token**
```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -b cookies.txt -c cookies.txt -v
```

**5. Logout**
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -b cookies.txt
```

---

### Complete Task Management Workflow

This example demonstrates a complete workflow for managing tasks.

**1. Login and save the access token**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestPass123!"}' \
  -c cookies.txt

# Save the accessToken from the response
export TOKEN="<access_token_from_response>"
```

**2. Create your first task**
```bash
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete API documentation",
    "description": "Write comprehensive documentation for all endpoints",
    "status": "todo",
    "priority": "high",
    "dueDate": "2024-12-31",
    "clientId": "web-app-123"
  }'

# Save the task ID from the response
export TASK_ID="<task_id_from_response>"
```

**3. List all tasks**
```bash
curl -X GET http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN"
```

**4. Update task status**
```bash
curl -X PATCH http://localhost:5000/api/v1/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "version": 1,
    "clientId": "web-app-123"
  }'
```

**5. Search for tasks**
```bash
curl -X GET "http://localhost:5000/api/v1/tasks?search=documentation&status=in-progress" \
  -H "Authorization: Bearer $TOKEN"
```

**6. Mark task as complete**
```bash
curl -X PATCH http://localhost:5000/api/v1/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "done",
    "version": 2,
    "clientId": "web-app-123"
  }'
```

**7. Delete task (soft delete)**
```bash
curl -X DELETE "http://localhost:5000/api/v1/tasks/$TASK_ID?version=3" \
  -H "Authorization: Bearer $TOKEN"
```

**8. Bulk operations**
```bash
curl -X POST http://localhost:5000/api/v1/tasks/bulk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "web-app-123",
    "operations": [
      {
        "type": "create",
        "tempId": "temp-1",
        "data": {
          "title": "Review pull requests",
          "description": "Review pending PRs",
          "priority": "medium"
        }
      },
      {
        "type": "create",
        "tempId": "temp-2",
        "data": {
          "title": "Write unit tests",
          "description": "Add tests for task endpoints",
          "priority": "high"
        }
      }
    ]
  }'
```

---

### Complete Tag Management Workflow

This example demonstrates creating and managing tags for task organization.

**1. Create tags for organization**
```bash
# Create Work tag with custom color
curl -X POST http://localhost:5000/api/v1/tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Work", "color": "#FF5733"}'

# Create Personal tag with default color
curl -X POST http://localhost:5000/api/v1/tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Personal"}'

# Create Urgent tag
curl -X POST http://localhost:5000/api/v1/tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Urgent", "color": "#FF0000"}'

# Save tag IDs from responses
export WORK_TAG_ID="<tag_id_from_response>"
export PERSONAL_TAG_ID="<tag_id_from_response>"
export URGENT_TAG_ID="<tag_id_from_response>"
```

**2. List all tags**
```bash
curl -X GET http://localhost:5000/api/v1/tags \
  -H "Authorization: Bearer $TOKEN"
```

**3. Search for specific tags**
```bash
# Search for tags containing "work" (case-insensitive)
curl -X GET "http://localhost:5000/api/v1/tags?search=work" \
  -H "Authorization: Bearer $TOKEN"
```

**4. Get a specific tag**
```bash
curl -X GET http://localhost:5000/api/v1/tags/$WORK_TAG_ID \
  -H "Authorization: Bearer $TOKEN"
```

**5. Update tag color**
```bash
# Change Work tag color to green
curl -X PATCH http://localhost:5000/api/v1/tags/$WORK_TAG_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"color": "#00FF00"}'
```

**6. Update tag name**
```bash
# Rename Personal to Home
curl -X PATCH http://localhost:5000/api/v1/tags/$PERSONAL_TAG_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Home"}'
```

**7. Use tags with tasks**
```bash
# Create task with multiple tags
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Prepare quarterly report",
    "description": "Compile Q4 metrics and analysis",
    "priority": "high",
    "tags": ["'"$WORK_TAG_ID"'", "'"$URGENT_TAG_ID"'"],
    "clientId": "web-app-123"
  }'

# Filter tasks by tag
curl -X GET "http://localhost:5000/api/v1/tasks?tags=$WORK_TAG_ID" \
  -H "Authorization: Bearer $TOKEN"
```

**8. Delete a tag**
```bash
# Delete the Urgent tag (automatically removes from all tasks)
curl -X DELETE http://localhost:5000/api/v1/tags/$URGENT_TAG_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

### Testing Error Scenarios

#### Test validation errors (400)
```bash
# Invalid email
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "password": "Pass123!", "name": "Test"}'

# Weak password (missing uppercase)
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test"}'
```

#### Test rate limiting (429)
```bash
# Make 6 failed login attempts
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "wrongpassword"}'
done
```

#### Test unauthorized access (401)
```bash
# Access protected route without token
curl -X GET http://localhost:5000/api/v1/auth/me
```

#### Test token reuse detection (403)
```bash
# 1. Refresh token once
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -b cookies.txt -c cookies_new.txt

# 2. Try to use the old cookie again
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -b cookies.txt
# Returns 403 TOKEN_REUSE_DETECTED
```

---

### Automated Testing with pytest

#### Setup test environment
```bash
# Run all tests
uv run pytest

# Run with coverage report
uv run pytest --cov=src --cov-report=html

# Run specific test file
uv run pytest tests/test_auth_endpoints.py

# Run with verbose output
uv run pytest -v
```

#### Create test fixtures (tests/conftest.py)
```python
import pytest
from src.app import create_app
from src.database import db
from src.models import User
from src.utils.password_utils import hash_password

@pytest.fixture
def app():
    app = create_app()
    app.config.from_object('src.config.TestingConfig')

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def test_user(app):
    user = User(
        email='test@example.com',
        password_hash=hash_password('password123'),
        name='Test User'
    )
    db.session.add(user)
    db.session.commit()
    return user
```

---

## Error Handling

All error responses follow a consistent format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "timestamp": "2026-01-12T10:30:00Z"
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid input data |
| 400 | `INVALID_REQUEST` | Missing request body |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 401 | `TOKEN_EXPIRED` | Access token has expired |
| 401 | `INVALID_TOKEN` | Malformed or invalid token |
| 403 | `TOKEN_REUSE_DETECTED` | Security breach - token reused |
| 403 | `FORBIDDEN` | User not authorized to access this resource |
| 404 | `NOT_FOUND` | Resource not found |
| 404 | `USER_NOT_FOUND` | User does not exist |
| 404 | `TASK_NOT_FOUND` | Task does not exist |
| 404 | `TAG_NOT_FOUND` | Tag does not exist |
| 409 | `EMAIL_EXISTS` | Email already registered |
| 409 | `TAG_NAME_EXISTS` | Tag name already exists for this user |
| 409 | `CONFLICT` | Version mismatch - resource modified by another client |
| 413 | `PAYLOAD_TOO_LARGE` | Request payload exceeds size limit |
| 429 | `TOO_MANY_ATTEMPTS` | Rate limit exceeded |
| 500 | `INTERNAL_ERROR` | Server error |

### Validation Error Format

For validation errors (400), the response includes field-specific errors:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "fields": {
    "email": ["Must be a valid email address"],
    "password": ["Must be at least 8 characters", "Must contain uppercase letter"]
  },
  "timestamp": "2026-01-12T10:30:00Z"
}
```

---

## Security

### Password Security
- **Hashing**: bcrypt with 12 rounds (configurable)
- **Requirements**:
  - 8-128 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

### Token Security
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Access Token**: Short-lived (15 minutes), stored client-side
- **Refresh Token**: Long-lived (7-30 days), stored in HTTPOnly cookie
- **Token Rotation**: New refresh token issued on each refresh
- **Token Reuse Detection**: Entire token family revoked if reuse detected

### Cookie Security
- **HTTPOnly**: Prevents JavaScript access
- **Secure**: HTTPS only in production
- **SameSite**: Strict (prevents CSRF)
- **Path**: Scoped to `/api/v1/auth` only

### Rate Limiting
- **Login attempts**: 5 failures per 15 minutes per email
- **Block duration**: 15 minutes
- **Tracked by**: Email and IP address

### Additional Security Measures
- Generic error messages (no email enumeration)
- IP address and User-Agent logging for audit trail
- CORS configuration for allowed origins
- Password hash never returned in API responses

---

## Flask CLI Commands

Useful commands for database management:

```bash
# Initialize database tables
uv run flask --app src.app init-db

# Drop all tables
uv run flask --app src.app drop-db --yes

# Seed test user (test@example.com / password123)
uv run flask --app src.app seed-db

# Clean up expired tokens
uv run flask --app src.app cleanup-tokens

# Clean up old login attempts
uv run flask --app src.app cleanup-login-attempts
```

---

## Troubleshooting

### Issue: "Database connection error"
**Solution:**
1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `.env` file
3. Verify database credentials
4. Create database if it doesn't exist

### Issue: "refresh_token cookie not found"
**Solution:**
1. Cookie path is `/api/v1/auth` - only sent to auth endpoints
2. Use `-b cookies.txt` flag in cURL to send cookies
3. Ensure cookies.txt file contains `refresh_token`

### Issue: "401 Unauthorized on /auth/me"
**Solution:**
1. Token format must be: `Bearer <token>` (note the space)
2. Token expires in 15 minutes - get a fresh one
3. Check Authorization header is set correctly

### Issue: "Rate limit exceeded"
**Solution:**
Wait 15 minutes or clean login_attempts table:
```bash
uv run flask --app src.app cleanup-login-attempts
```

---

## API Versioning

Current version: **v1**

All endpoints are prefixed with `/api/v1`. Future versions will use `/api/v2`, etc.


---

**Last Updated:** January 24, 2026
**API Version:** 1.0
**Author:** Samuel Olumide Oluwole

**Features Added:**
- Task Management API with CRUD operations
- Tag-based task categorization
- Advanced filtering, search, and pagination
- Optimistic locking for conflict resolution
- Bulk operations for efficient syncing
- Offline sync support with clientId and version tracking
