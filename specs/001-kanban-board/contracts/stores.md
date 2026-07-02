# Contract: Store Modules (`src/stores/`)

**Feature**: 001-kanban-board
**Date**: 2026-06-26

Store modules encapsulate all data access and business logic. They call `query()` / `execute()`
from `database.js` and expose domain-level functions to components. No component writes SQL
directly.

All store functions are synchronous (SQLite WASM runs synchronously in the main thread after
`initDatabase()` resolves).

---

## Type Definitions (for documentation — plain JS, no TypeScript)

```
User    = { id: string, name: string, role: 'product_manager'|'engineer', initials: string }
Project = { id: string, name: string, created_at: number }
Member  = User  // when returned from project membership queries
Task    = { id: string, project_id: string, title: string, description: string|null,
            assignee_id: string|null, column_key: string, sort_order: number, created_at: number }
Comment = { id: string, task_id: string, author_id: string, body: string,
            created_at: number, updated_at: number }
ColumnKey = 'todo' | 'in_progress' | 'in_review' | 'done'
BoardData = { todo: Task[], in_progress: Task[], in_review: Task[], done: Task[] }
```

---

## `src/stores/users.js`

### Exports

#### `getAllUsers(): User[]`
Returns all 5 predefined users ordered by role (product_manager first) then name.

#### `getUser(id: string): User | null`
Returns the user with the given id, or null if not found.

#### `getCurrentUser(): User | null`
Returns the currently active user from in-memory session state (not persisted to DB).
Returns null if no profile has been selected yet.

#### `setCurrentUser(id: string): void`
Sets the active user for the current session. Loads the user from DB and stores in memory.
Throws if id does not correspond to a known user.

#### `clearCurrentUser(): void`
Clears the active user (used when returning to profile selection).

---

## `src/stores/projects.js`

### Exports

#### `getProjectsForUser(userId: string): Project[]`
Returns all projects where the given user is a member, ordered by `created_at` descending
(newest first).

#### `getProject(id: string): Project | null`
Returns the project with the given id, or null if not found.

#### `createProject(name: string): Project`
Creates a new project with the given name.
- Trims whitespace from name before insert.
- Throws if trimmed name is empty.
- Returns the created project.
- Does NOT automatically add the creating user as a member; caller must call `addMember()`.

#### `getMembers(projectId: string): User[]`
Returns all users who are members of the given project, ordered by role then name.

#### `addMember(projectId: string, userId: string): void`
Adds a user to a project's member list.
- No-op if the user is already a member (INSERT OR IGNORE).
- Throws if projectId or userId does not exist.

#### `removeMember(projectId: string, userId: string): void`
Removes a user from a project's member list.
- No-op if the user is not a member.

#### `isMember(projectId: string, userId: string): boolean`
Returns true if the given user is a member of the given project.

---

## `src/stores/tasks.js`

### Exports

#### `getTasksByColumn(projectId: string): BoardData`
Returns all tasks for the given project, grouped into the four column arrays, each ordered by
`sort_order` ascending.

#### `getTask(id: string): Task | null`
Returns the task with the given id, or null if not found.

#### `createTask(projectId: string, title: string, options?: { description?: string, assigneeId?: string }): Task`
Creates a new task in the `todo` column.
- Trims title; throws if empty after trim.
- `sort_order` is set to `MAX(sort_order) + 1` within `(projectId, 'todo')`.
- Returns the created task.

#### `moveTask(taskId: string, targetColumn: ColumnKey): void`
Updates the task's `column_key` to `targetColumn`.
- Sets `sort_order` to `MAX(sort_order) + 1` within `(project_id, targetColumn)`.
- No-op if `targetColumn` equals the task's current `column_key`.
- Throws if taskId is not found.

#### `updateTask(taskId: string, updates: { title?: string, description?: string, assigneeId?: string | null }): Task`
Updates one or more fields of a task.
- If `title` is provided, trims and validates non-empty.
- Returns the updated task.
- Throws if taskId is not found.

---

## `src/stores/comments.js`

### Exports

#### `getComments(taskId: string): Comment[]`
Returns all comments for the given task, ordered by `created_at` ascending (oldest first).

#### `addComment(taskId: string, authorId: string, body: string): Comment`
Creates a new comment.
- Trims body; throws if empty after trim.
- Returns the created comment.

#### `editComment(commentId: string, requestingUserId: string, newBody: string): Comment`
Edits an existing comment's body.
- Throws if `requestingUserId` does not match the comment's `author_id` (ownership check).
- Trims body; throws if empty after trim.
- Updates `updated_at` to current timestamp.
- Returns the updated comment.

#### `deleteComment(commentId: string, requestingUserId: string): void`
Deletes a comment.
- Throws if `requestingUserId` does not match the comment's `author_id` (ownership check).

#### `canModifyComment(commentId: string, userId: string): boolean`
Returns true if the given user is the author of the given comment.
Used by components to conditionally render edit/delete controls.
