# Contract: Component Modules (`src/components/`)

**Feature**: 001-kanban-board
**Date**: 2026-06-26

Components are vanilla JS modules that create and return `HTMLElement` instances. They read state
from store modules and emit DOM events for user interactions. No component holds persistent state
— state lives in stores (DB-backed) or in the router.

**Component contract pattern**:
```js
// Every component factory must follow this signature:
function createComponentName(props): HTMLElement
```

Components MUST NOT call `query()` or `execute()` directly. All data access goes through stores.

---

## `src/components/profile-selector.js`

### `createProfileSelector({ onSelect }): HTMLElement`

Renders the full-screen profile selection view showing all 5 users.

**Props**:
- `onSelect(user: User): void` — called when the user clicks a profile card.

**Renders**:
- A card for each user showing: name, role badge, initials avatar.
- 5 cards total; layout accommodates all roles.

**Accessibility**: Each profile card is a `<button>` element, keyboard-focusable and
activatable via Enter/Space.

---

## `src/components/project-list.js`

### `createProjectList({ userId, onSelectProject, onCreateProject }): HTMLElement`

Renders the list of projects the active user is a member of.

**Props**:
- `userId: string` — filters projects via `getProjectsForUser()`.
- `onSelectProject(projectId: string): void` — called on project card click.
- `onCreateProject(): void` — called when the "New Project" button is clicked.

**Renders**:
- One card per project, showing project name.
- Empty state: guidance message + "New Project" button if no projects.
- "New Project" button always visible at top or bottom of list.

**Accessibility**: Project cards are `<button>` or `<a>` elements; "New Project" is a `<button>`.

---

## `src/components/project-form.js`

### `createProjectForm({ onSubmit, onCancel }): HTMLElement`

Renders a form for creating a new project (modal or inline).

**Props**:
- `onSubmit(name: string): void` — called with the validated project name on submit.
- `onCancel(): void` — called on cancel/close.

**Validation**: Displays an inline error if the submitted name is empty after trimming.
Submit button is disabled while the input is empty.

---

## `src/components/member-manager.js`

### `createMemberManager({ projectId, onClose }): HTMLElement`

Renders the member management panel for a project.

**Props**:
- `projectId: string` — the project whose membership is managed.
- `onClose(): void` — called when the panel is dismissed.

**Renders**:
- Current members list with a "Remove" button per member.
- Available users (not yet members) list with an "Add" button per user.

---

## `src/components/kanban-board.js`

### `createKanbanBoard({ projectId, currentUserId }): HTMLElement`

Renders the full Kanban board with 4 columns for the given project.

**Props**:
- `projectId: string`
- `currentUserId: string` — used to highlight assigned task cards.

**Renders**:
- 4 column components (To Do, In Progress, In Review, Done) side by side.
- A header bar with: project name, "Add Task" button, "Manage Members" button, profile switcher.
- Empty-column state: guidance text inside each empty column.

**Drag and Drop**: Attaches `dragover` and `drop` handlers on each column container via
`makeDropTarget()` from `src/utils/dnd.js`. On drop, calls `moveTask()` then re-renders the
affected columns.

---

## `src/components/kanban-column.js`

### `createKanbanColumn({ columnKey, label, tasks, currentUserId, onTaskClick, onDrop }): HTMLElement`

Renders a single Kanban column.

**Props**:
- `columnKey: ColumnKey`
- `label: string` — display label ("To Do", etc.)
- `tasks: Task[]` — ordered by sort_order.
- `currentUserId: string`
- `onTaskClick(taskId: string): void`
- `onDrop(taskId: string, targetColumnKey: ColumnKey): void`

**Renders**:
- Column header with label and task count badge.
- Stack of `TaskCard` components.
- Drop zone visual feedback when a card is dragged over.

---

## `src/components/task-card.js`

### `createTaskCard({ task, currentUserId, onClick }): HTMLElement`

Renders a single task card for display in a column.

**Props**:
- `task: Task`
- `currentUserId: string` — if `task.assignee_id === currentUserId`, applies highlight class.
- `onClick(): void`

**Renders**:
- Task title.
- Assignee name (or "Unassigned").
- Highlight CSS class (`task-card--mine`) when assigned to current user.

**Drag**: `draggable="true"` + `dragstart` handler via `makeDraggable()`, encoding `task.id`
as the drag data.

**Accessibility**: The card is a `<div role="button" tabindex="0">` or `<button>`, activatable
via Enter/Space to open the detail view.

---

## `src/components/task-form.js`

### `createTaskForm({ projectId, onSubmit, onCancel }): HTMLElement`

Renders the new-task creation form.

**Props**:
- `projectId: string` — the project the task will belong to.
- `onSubmit(title: string, description: string | null, assigneeId: string | null): void`
- `onCancel(): void`

**Renders**:
- Title input (required).
- Description textarea (optional).
- Assignee selector dropdown (project members only + "Unassigned" option).
- Submit and Cancel buttons.

**Validation**: Title must be non-empty after trim. Inline error shown, submit blocked otherwise.

---

## `src/components/task-detail.js`

### `createTaskDetail({ taskId, currentUserId, onClose }): HTMLElement`

Renders the full task detail view (modal overlay).

**Props**:
- `taskId: string`
- `currentUserId: string`
- `onClose(): void`

**Renders**:
- Task title, description, assignee, current column/status.
- Comment list via `createCommentList()`.
- Comment input form.
- Close button.

**Accessibility**: Focus is trapped inside the modal while open. Escape key closes the modal.
Close button is a `<button>`.

---

## `src/components/comment-list.js`

### `createCommentList({ taskId, currentUserId }): HTMLElement`

Renders all comments for a task with edit/delete controls where applicable.

**Props**:
- `taskId: string`
- `currentUserId: string`

**Renders**:
- Each comment: author name, timestamp, body text.
- For comments where `canModifyComment(commentId, currentUserId)` is true: Edit and Delete
  buttons are rendered.
- For all other comments: no edit/delete controls rendered or present in DOM.
- Empty state: "No comments yet" message.

**Edit flow**: Clicking Edit replaces the comment body with an editable `<textarea>` inline.
Save and Cancel buttons appear. Save calls `editComment()`, Cancel restores the original text.

---

## `src/components/app.js`

### `createApp(): HTMLElement`

Root application component. Initializes the router, subscribes to route changes, and mounts the
correct top-level component for each route.

**Routes handled**:
- `#/` → `createProfileSelector()`
- `#/projects` → `createProjectList()`
- `#/projects/:id` → `createKanbanBoard()`

Unmounts the current view and mounts the new one on each navigation event.
