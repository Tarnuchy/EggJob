# EggJob - Backend API Requirements for Frontend

## Conventions
- Base URL: `https://api.eggjob.app` (TBD)
- Auth: Bearer JWT token in `Authorization` header (all protected endpoints)
- Responses: JSON
- Error format: `{ "detail": "message" }` (FastAPI standard)

## 1. Authentication (no auth header required)

### POST /auth/register
Request: `{ email: string, username: string, password: string }`
Response 201: `{ account_id: string, user_id: string, access_token: string }`
Errors: 409 email taken, 409 username taken, 422 validation

### POST /auth/login
Request: `{ email: string, password: string }`
Response 200: `{ account_id: string, user_id: string, access_token: string }`
Errors: 401 invalid credentials, 422 validation

### POST /auth/logout
Response 204 (invalidates token server-side if blacklisting is used)

## 2. Profile

### GET /users/{user_id}
Response 200: `{ id: string, account_id: string, username: string, photo_url: string | null }`

### PUT /users/{user_id}
Request: `{ username?: string, photo_url?: string }`
Response 200: updated User object

### DELETE /accounts/{account_id}
Request: `{ password: string }`
Response 204

## 3. Friends and Invitations

### GET /friends
Response 200: `{ items: Array<{ user_id: string, username: string, photo_url: string | null }> }`

### POST /friends/invite
Request: `{ target_username: string }`
Response 201: `{ invitation_id: string }`

### POST /invitations/{invitation_id}/accept
Response 200

### POST /invitations/{invitation_id}/reject
Response 200

### DELETE /friends/{friend_user_id}
Response 204

## 4. Task Groups

### POST /task-groups
Request: `{ name: string, privacy: "public" | "private", is_bingo: boolean, type: "cooperative" | "competitive" }`
Response 201: `{ id: string, invite_code: string, ... }`

### PUT /task-groups/{group_id}
Request: `{ name?: string, privacy?: string }`
Response 200

### DELETE /task-groups/{group_id}
Response 204

### POST /task-groups/{group_id}/members
Request: `{ user_id: string, role: "editor" | "viewer" }`
Response 201

### DELETE /task-groups/{group_id}/members/{user_id}
Response 204

### POST /task-groups/{group_id}/leave
Response 204

## 5. Tasks and Progress

### POST /tasks
Request: `{ group_id: string, name: string, type: "endless" | "one_time" | "repeatable" | "challenge", goal: number, params: { photo_required: boolean, color: string, notifications: boolean } }`
Response 201: `{ id: string, progress_id: string }`

### PUT /tasks/{task_id}
Request: `{ name?: string, description?: string, goal?: number }`
Response 200

### DELETE /tasks/{task_id}
Response 204

### POST /tasks/{task_id}/progress
Request: `{ value: number, note?: string, photo_url?: string }`
Response 201: `{ entry_id: string }`

### GET /tasks/{task_id}/progress
Response 200: `{ entries: Array<ProgressEntry> }`

## 6. Comments and Notifications

### POST /progress-entries/{entry_id}/comments
Request: `{ message: string }`
Response 201: `{ comment_id: string }`

### DELETE /comments/{comment_id}
Response 204

### GET /notifications
Response 200: `{ items: Array<{ id: string, message: string, active: boolean }> }`

### PUT /notifications/{notification_id}/read
Response 200

## Frontend Integration Pattern

When replacing mocks with real API:
1. Create `src/frontend/services/api/ApiAuthService.ts` implementing `IAuthService`
2. Store `access_token` in `@react-native-async-storage/async-storage`
3. Create axios/fetch client with Authorization header injection
4. In `src/frontend/services/index.ts` swap mock imports for API imports
5. Add session restore on app start (check AsyncStorage, auto-login)

## Token Storage (to implement on frontend side)
- Library: `@react-native-async-storage/async-storage`
- Key: `@eggjob:access_token`
- Pattern: save on login/register, clear on logout, attach to every protected request
