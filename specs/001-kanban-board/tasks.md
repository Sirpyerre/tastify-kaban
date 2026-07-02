---
description: "Task list for Taskify Kanban Board Platform"
---

# Tasks: Taskify Kanban Board Platform

**Input**: Design documents from `specs/001-kanban-board/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Included — constitution Principle II mandates TDD with all three test layers. E2E tests
are written before each user story's implementation. Integration tests are written before the DB
layer implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.
All audit gaps from the plan review have been incorporated as specific tasks.

**Audit gaps addressed**:
- `opfs-sahpool` VFS specified in T013; `:memory:` test VFS in T012
- `PRAGMA foreign_keys = ON` in T014
- `vite.config.js` full content in T002
- Event bus for state propagation: T008
- Profile guard in router: T010
- Assignee name in `getTasksByColumn` return type: T019
- Loading screen component: T021
- `canModifyComment(comment, userId)` signature: T020
- Modal overlay utility: T011
- `seed-data.js` contract: T015

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1–US6); omitted for Setup, Foundational, and Polish phases

---

## Phase 1: Setup

**Purpose**: Initialize the project scaffold. All tasks can start immediately; most can run in parallel.

- [x] T001 Create `package.json` with name `taskify`, scripts `dev` (`vite`), `build` (`vite build`), `preview` (`vite preview`), `test` (`vitest`), `test:watch` (`vitest --watch`), `test:coverage` (`vitest --coverage`), `test:e2e` (`playwright test`), `test:e2e:ui` (`playwright test --ui`); devDependencies: `vite`, `@sqlite.org/sqlite-wasm`, `vitest`, `@vitest/coverage-v8`, `@playwright/test`
- [x] T002 [P] Create `vite.config.js` with: (a) COOP/COEP header plugin for dev server (`Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`), (b) `optimizeDeps.exclude: ['@sqlite.org/sqlite-wasm']` to prevent Vite from bundling the WASM package, (c) `server.headers` for the same COOP/COEP headers, (d) Vitest config block with `test.environment: 'node'`, `test.coverage.provider: 'v8'`, `test.coverage.threshold.lines: 80`, `test.include: ['tests/unit/**', 'tests/integration/**']`
- [x] T003 [P] Create `src/styles/tokens.css` with all CSS custom property design tokens (colors: `--color-brand-primary`, `--color-user-highlight`, `--color-neutral-*`; spacing: `--spacing-xs/sm/md/lg/xl` on 4px scale; typography: `--font-size-sm/md/lg`, `--font-weight-normal/semibold`; radius: `--radius-sm/md/lg`; shadow: `--shadow-card`, `--shadow-modal`); also create `src/styles/base.css` (CSS reset + base element styles) and stub `src/styles/components.css`
- [x] T004 [P] Create `index.html` as the single entry point: `<head>` includes `<link>` to all three CSS files and `<meta>` for charset/viewport; `<body>` contains `<div id="app"></div>` and `<script type="module" src="/src/main.js">`; add `<link rel="modulepreload">` hint for `@sqlite.org/sqlite-wasm`

**Checkpoint**: `npm run dev` starts without errors; browser loads `index.html` at `http://localhost:5173` with COOP/COEP headers confirmed in Network tab.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: All utilities, the DB layer, all stores, and the loading screen must be complete before
any user story work begins. Utilities are all independent; DB layer is sequential (database →
migrations → seed); stores are independent of each other but require the DB layer.

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete.

### Utilities (all parallel — different files, no inter-dependencies)

- [x] T005 [P] Implement `src/utils/id.js` exporting `generateId(): string` — returns `crypto.randomUUID()`; wrap in a named export so tests can substitute a deterministic generator
- [x] T006 [P] Implement `src/utils/time.js` exporting `nowUnix(): number` (returns `Math.floor(Date.now() / 1000)`) and `formatTimestamp(unixSeconds: number): string` (returns locale-formatted string via `Intl.DateTimeFormat`, e.g. `"Jun 26, 2026 at 14:03"`)
- [x] T007 [P] Implement `src/utils/dom.js` exporting `createElement(tag, attributes, children)`, `clearElement(el)`, `showElement(el)`, `hideElement(el)` as documented in `contracts/utilities.md`
- [x] T008 [P] Implement `src/utils/event-bus.js` exporting a singleton `EventBus` with `on(event, handler)`, `off(event, handler)`, and `emit(event, data)` — this is the state propagation mechanism used by store mutating functions to notify components to re-render; define event name constants: `BOARD_UPDATED`, `PROJECT_LIST_UPDATED`, `TASK_UPDATED`, `COMMENT_UPDATED`
- [x] T009 [P] Implement `src/utils/dnd.js` exporting `makeDraggable(element, taskId)` and `makeDropTarget(element, onDrop)` exactly as specified in `contracts/utilities.md`; add `task-card--dragging` and `kanban-column--drag-over` CSS class names as constants
- [x] T010 [P] Implement `src/utils/router.js` exporting `navigate(path)`, `onRoute(pattern, handler)`, and `start()`; include a `requireUser()` guard helper that checks `getCurrentUser()` from `src/stores/users.js` and calls `navigate('/')` if null; register this guard for the `#/projects` and `#/projects/:id` routes
- [x] T011 [P] Implement `src/utils/modal.js` exporting `openModal(contentElement): void` and `closeModal(): void`; creates a full-screen overlay `<div class="modal-overlay">` that traps focus, closes on Escape key, and appends the content element inside a `<div class="modal-dialog">`; add `modal-overlay` and `modal-dialog` styles to `src/styles/components.css`

### DB Layer (sequential — each step depends on the previous)

- [x] T012 Write integration tests **before** implementing the DB layer — create `tests/integration/db/database.test.js`, `tests/integration/db/migrations.test.js`, `tests/integration/db/seed.test.js` based on contracts in `contracts/database.md`; tests MUST use `:memory:` VFS (pass `':memory:'` as the database filename to bypass OPFS, which is unavailable in Node.js); confirm all tests **fail** before proceeding to T013
- [x] T013 Implement `src/db/database.js`: initialize `@sqlite.org/sqlite-wasm` using the `opfs-sahpool` VFS for browser persistence (this VFS requires SharedArrayBuffer, enabled by the COOP/COEP headers in T002); accept an optional `vfsOverride` parameter (default `'opfs-sahpool'`) so tests can pass `':memory:'`; export `initDatabase(options?)`, `query(sql, params)`, `execute(sql, params)`, `transaction(fn)`; emit `console.info` on successful init and `console.error` on failure with a user-readable message
- [x] T014 Implement `src/db/migrations.js`: export `runMigrations()` which checks `PRAGMA user_version`, runs migration 1 if `user_version === 0` (full schema DDL from `data-model.md` including all tables, indexes), then executes `PRAGMA foreign_keys = ON` on every connection open (foreign key enforcement is per-connection in SQLite), and sets `PRAGMA user_version = 1`; call `runMigrations()` inside `initDatabase()` after the connection opens
- [x] T015 [P] Create `src/data/seed-data.js` exporting a default object `SEED_DATA` containing: `users` array (5 users with fixed IDs `user-pm-1`, `user-eng-1` through `user-eng-4`, names, roles, initials from `data-model.md`); `projects` array (3 projects with fixed IDs, names); `tasks` array (30 tasks total: 10 for project 1, 8 for project 2, 12 for project 3, each with `title`, `column_key`, `assignee_id`, `project_id` from the seed tables in `data-model.md`); `members` array (all 5 users as members of all 3 projects)
- [x] T016 Implement `src/db/seed.js` exporting `seedIfEmpty()`: checks if the `users` table is empty; if so, wraps all inserts (users, projects, project_members, tasks) in a single transaction using `execute()` from `database.js`, reading data from `SEED_DATA` in `src/data/seed-data.js`; sets `sort_order` values for tasks to maintain the column order defined in `data-model.md`; call `seedIfEmpty()` inside `initDatabase()` after `runMigrations()`

### Stores (parallel with each other — all depend on T013–T016)

- [x] T017 [P] Implement `src/stores/users.js` with module-level `let currentUser = null` for session state; export `getAllUsers()`, `getUser(id)`, `getCurrentUser()`, `setCurrentUser(id)`, `clearCurrentUser()` as specified in `contracts/stores.md`
- [x] T018 [P] Implement `src/stores/projects.js` exporting `getProjectsForUser(userId)`, `getProject(id)`, `createProject(name)`, `getMembers(projectId)`, `addMember(projectId, userId)`, `removeMember(projectId, userId)`, `isMember(projectId, userId)`; mutating functions (`createProject`, `addMember`, `removeMember`) MUST call `EventBus.emit('PROJECT_LIST_UPDATED')` after a successful write
- [x] T019 Implement `src/stores/tasks.js`; `getTasksByColumn(projectId)` MUST return enriched `BoardData` where each `Task` object includes an additional `assignee_name: string | null` field (join `tasks` with `users` on `assignee_id` in the SQL query so components do not need a second lookup); `moveTask()` MUST call `EventBus.emit('BOARD_UPDATED', { projectId })` after write; `createTask()` MUST also emit `BOARD_UPDATED`; all other exports per `contracts/stores.md`
- [x] T020 [P] Implement `src/stores/comments.js`; **corrected signature**: `canModifyComment(comment, userId)` takes the full `Comment` object (which has `author_id`) not a `commentId` — returns `comment.author_id === userId`; `editComment()` and `deleteComment()` still verify ownership internally before executing; mutating functions emit `EventBus.emit('COMMENT_UPDATED', { taskId })`; all other exports per `contracts/stores.md`

### Loading Screen and Bootstrap

- [x] T021 [P] Implement `src/components/loading-screen.js` exporting `createLoadingScreen(): HTMLElement` — renders a full-page centered spinner with text "Loading Taskify…"; styled using design tokens from `tokens.css`; shown by `main.js` before `initDatabase()` resolves and unmounted immediately after
- [x] T022 Implement `src/main.js`: (1) mount `createLoadingScreen()` into `#app` immediately; (2) call `await initDatabase()`; (3) if init fails, replace loading screen with a full-page error message ("Taskify could not start. Your browser may not support OPFS storage. Try Chrome 120+ or Firefox 120+."); (4) on success, unmount loading screen and mount `createApp()` into `#app`

**Checkpoint**: `npm test` runs integration tests against `:memory:` SQLite; `migrations.test.js` and `seed.test.js` pass. Browser loads app and transitions from loading screen to a blank view (profile selector not yet implemented, just no crash).

---

## Phase 3: User Story 1 — Profile Selection on Launch (Priority: P1) 🎯 MVP

**Goal**: User opens the app and sees all 5 predefined profile cards. Clicking one establishes session identity and navigates to the project list.

**Independent Test**: Open the app in a fresh browser session → verify 5 profile cards appear with name + role → click any card → confirm the app transitions with that user's name visible.

### Tests for User Story 1 ⚠️ Write first — confirm failure before implementing

- [x] T023 Write E2E test `tests/e2e/us1-profile-selection.spec.js` covering all acceptance scenarios from `spec.md` US1: (a) 5 profiles visible with correct names and roles on launch; (b) clicking a profile navigates away from profile selector; (c) active user name visible in resulting view; (d) profile can be switched back via a header control — confirm tests **fail** before T024

### Implementation for User Story 1

- [x] T024 [P] [US1] Implement `src/components/profile-selector.js` exporting `createProfileSelector({ onSelect })`: renders a `<section class="profile-selector">` containing 5 `<button class="profile-card">` elements, each showing initials avatar, name, and role badge; call `onSelect(user)` on click; all buttons keyboard-accessible
- [x] T025 [US1] Implement `src/components/app.js` exporting `createApp(): HTMLElement`: registers router routes (`#/` → profile selector, `#/projects` → project list, `#/projects/:id` → kanban board); profile selector's `onSelect` calls `setCurrentUser(user.id)` then `navigate('/projects')`; includes a persistent header bar with active user name and a "Switch Profile" button that calls `clearCurrentUser()` then `navigate('/')`; header is hidden on the `#/` route; use `router.start()` to activate routing

**Checkpoint**: `npm run test:e2e -- us1` passes. Profile selection is fully functional.

---

## Phase 4: User Story 2 — View Project List and Kanban Board (Priority: P2)

**Goal**: After profile selection the user sees their projects listed. Opening a project shows a 4-column Kanban board with sample tasks. Tasks assigned to the active user appear highlighted.

**Independent Test**: Log in as any user → project list shows 3 sample projects → open one → 4 columns appear in correct order → task cards show title + assignee name → tasks assigned to active user have `task-card--mine` CSS class.

### Tests for User Story 2 ⚠️ Write first — confirm failure before implementing

- [x] T026 Write E2E test `tests/e2e/us2-board-view.spec.js`: (a) all 3 sample projects listed after profile selection; (b) project opens to board with exactly 4 columns in correct order; (c) task cards visible with title and assignee; (d) cards assigned to active user have the highlight class; (e) cards assigned to other users do not

### Implementation for User Story 2

- [x] T027 [P] [US2] Implement `src/components/project-list.js` exporting `createProjectList({ userId, onSelectProject, onCreateProject })`: calls `getProjectsForUser(userId)`, renders a `<ul class="project-list">` with one `<li><button class="project-card">` per project showing the project name; renders empty state with "No projects yet" + "New Project" button if list is empty; always renders a "New Project" `<button>` at top; subscribes to `EventBus.on('PROJECT_LIST_UPDATED', rerender)` to refresh when a project is created
- [x] T028 [US2] Implement `src/components/kanban-board.js` exporting `createKanbanBoard({ projectId, currentUserId })`: fetches project name and renders a `<div class="kanban-board">` containing a header bar (project name, "Add Task" button, "Manage Members" button, "Switch Profile" link) and 4 `<div class="kanban-board__columns">` containing one `createKanbanColumn()` per column; subscribes to `EventBus.on('BOARD_UPDATED', handler)` where handler checks `event.projectId === projectId` and re-renders all columns by calling `getTasksByColumn()` and replacing column content
- [x] T029 [US2] Implement `src/components/kanban-column.js` exporting `createKanbanColumn({ columnKey, label, tasks, currentUserId, onTaskClick, onDrop })`: renders `<div class="kanban-column">` with a header showing label + task count badge and a scrollable `<ul class="kanban-column__cards">` populated by `createTaskCard()` for each task; renders "No tasks yet" guidance when `tasks` is empty
- [x] T030 [US2] Implement `src/components/task-card.js` exporting `createTaskCard({ task, currentUserId, onClick })`: renders `<li class="task-card">` (with `task-card--mine` added when `task.assignee_id === currentUserId`); shows `task.title` and `task.assignee_name ?? 'Unassigned'`; element is a `<button>` or has `role="button" tabindex="0"` with Enter/Space keyboard handler calling `onClick()`
- [x] T031 [P] [US2] Add board, column, and card styles to `src/styles/components.css`: `.kanban-board` (full-height flex container), `.kanban-board__columns` (horizontal flex, overflow-x auto), `.kanban-column` (fixed-width card, flex-column), `.kanban-column__header` (label + badge), `.task-card` (white card, shadow-card, padding), `.task-card--mine` (background uses `--color-user-highlight`), `.profile-card` (avatar + name layout), `.project-card` (project list item)

**Checkpoint**: `npm run test:e2e -- us2` passes. Board view fully functional with sample data.

---

## Phase 5: User Story 3 — Drag and Drop Tasks Between Columns (Priority: P3)

**Goal**: Any user can drag a task card from one column and drop it into a different column. The move is reflected immediately and persisted. Dropping on the same column is a no-op. Cancelling mid-drag restores the card.

**Independent Test**: Open any project → drag a card from "To Do" to "In Progress" → card appears in "In Progress", gone from "To Do" → refresh page → card still in "In Progress".

### Tests for User Story 3 ⚠️ Write first — confirm failure before implementing

- [x] T032 Write E2E test `tests/e2e/us3-drag-and-drop.spec.js`: (a) drag card to a different column → card moves; (b) visual `--drag-over` class appears on target column during hover; (c) drop outside all columns → card unchanged; (d) drop on same column → card stays; (e) page reload preserves moved column position

### Implementation for User Story 3

- [x] T033 [US3] Wire drag into `src/components/task-card.js`: call `makeDraggable(cardElement, task.id)` inside `createTaskCard()`; this adds `draggable="true"` and the `dragstart` handler encoding the task ID
- [x] T034 [US3] Wire drop targets into `src/components/kanban-column.js`: call `makeDropTarget(columnElement, (taskId) => onDrop(taskId, columnKey))` inside `createKanbanColumn()`; this adds `dragover`/`dragleave`/`drop` handlers and the `--drag-over` visual class
- [x] T035 [US3] Implement column-move handler in `src/components/kanban-board.js`: the `onDrop(taskId, targetColumnKey)` callback calls `moveTask(taskId, targetColumnKey)` (which emits `BOARD_UPDATED`); the `BOARD_UPDATED` subscription already re-renders columns — confirm the subscription handler re-fetches `getTasksByColumn()` and replaces all four column elements

**Checkpoint**: `npm run test:e2e -- us3` passes. Drag and drop fully functional with persistence.

---

## Phase 6: User Story 4 — Create Projects and Manage Team Members (Priority: P4)

**Goal**: Any user can create a new project (with validation on empty name) and add or remove any of the 5 predefined users as members. New projects get all 4 empty columns.

**Independent Test**: Click "New Project" → submit a name → project appears in list → open it → 4 empty columns visible → open member management → add 2 users → both appear in member list → remove 1 → member list updates.

### Tests for User Story 4 ⚠️ Write first — confirm failure before implementing

- [x] T036 Write E2E test `tests/e2e/us4-projects-members.spec.js`: (a) create project with valid name → appears in list; (b) empty name rejected with error message; (c) new project board has 4 empty columns; (d) add member → appears in member list; (e) remove member → no longer in list; (f) all 5 users can be added to one project

### Implementation for User Story 4

- [x] T037 [P] [US4] Implement `src/components/project-form.js` exporting `createProjectForm({ onSubmit, onCancel })`: renders a `<form class="project-form">` with a text input for project name, an inline error `<span>` (hidden by default), and Submit + Cancel buttons; Submit is disabled while input is empty after trim; on submit, trims the name and calls `onSubmit(name)` if non-empty, else shows the error; Cancel calls `onCancel()`
- [x] T038 [P] [US4] Implement `src/components/member-manager.js` exporting `createMemberManager({ projectId, onClose })`: calls `getMembers(projectId)` and `getAllUsers()`, renders two lists — current members (each with a "Remove" button calling `removeMember()` then re-rendering) and available non-member users (each with "Add" calling `addMember()` then re-rendering); Close button calls `onClose()`
- [x] T039 [US4] Wire project creation in `src/components/project-list.js`: the "New Project" button's handler calls `openModal(createProjectForm({ onSubmit: (name) => { createProject(name); addMember(newProjectId, currentUserId); closeModal(); }, onCancel: closeModal }))` then re-renders the list via `PROJECT_LIST_UPDATED` event (already subscribed)
- [x] T040 [US4] Wire member management in `src/components/kanban-board.js`: "Manage Members" button calls `openModal(createMemberManager({ projectId, onClose: closeModal }))`

**Checkpoint**: `npm run test:e2e -- us4` passes. Project creation and member management fully functional.

---

## Phase 7: User Story 5 — Create and Assign Tasks (Priority: P5)

**Goal**: Any project member can create a task with a title (required), optional description, and optional assignee chosen from project members. New tasks appear in "To Do" immediately. Tasks assigned to the active user are highlighted.

**Independent Test**: Open a project → click "Add Task" → submit title only → task appears in "To Do" with "Unassigned" → add a second task assigned to the active user → that card appears highlighted in "To Do" → empty title is rejected.

### Tests for User Story 5 ⚠️ Write first — confirm failure before implementing

- [x] T041 Write E2E test `tests/e2e/us5-create-tasks.spec.js`: (a) create task title-only → appears in "To Do" as Unassigned; (b) create task with assignee → assignee name shown on card; (c) task assigned to active user has highlight class; (d) empty title rejected with error message; (e) task persists after page refresh

### Implementation for User Story 5

- [x] T042 [P] [US5] Implement `src/components/task-form.js` exporting `createTaskForm({ projectId, onSubmit, onCancel })`: renders a `<form class="task-form">` with required title `<input>`, optional description `<textarea>`, and assignee `<select>` populated with `getMembers(projectId)` + an "Unassigned" option; title validation identical to project-form (disabled submit + inline error); on submit calls `onSubmit(title, description || null, assigneeId || null)`
- [x] T043 [US5] Wire task creation in `src/components/kanban-board.js`: "Add Task" button handler calls `openModal(createTaskForm({ projectId, onSubmit: (title, desc, assigneeId) => { createTask(projectId, title, { description: desc, assigneeId }); closeModal(); }, onCancel: closeModal }))`; `createTask()` emits `BOARD_UPDATED` which triggers the column re-render already wired in Phase 4

**Checkpoint**: `npm run test:e2e -- us5` passes. Task creation fully functional with highlighting.

---

## Phase 8: User Story 6 — Comment on Tasks (Priority: P6)

**Goal**: Any project member can comment on any task. Comments show author name and timestamp. A user can edit or delete only their own comments; no controls are shown on other users' comments.

**Independent Test**: As User A, open a task and post a comment → comment shows User A's name and a timestamp → switch to User B → User A's comment visible with no edit/delete controls → User B posts a comment → User B sees edit/delete on their own comment → edit saves new text → delete removes comment → empty comment rejected.

### Tests for User Story 6 ⚠️ Write first — confirm failure before implementing

- [x] T044 Write E2E test `tests/e2e/us6-comments.spec.js`: (a) add comment → appears with author name + timestamp; (b) comments in chronological order; (c) own comment has Edit + Delete controls; (d) other user's comment has no Edit or Delete in DOM; (e) edit saves updated text; (f) delete removes comment; (g) empty comment body rejected; (h) comment count updates after add/delete

### Implementation for User Story 6

- [x] T045 [P] [US6] Implement `src/components/comment-list.js` exporting `createCommentList({ taskId, currentUserId })`: calls `getComments(taskId)`, renders a `<ul class="comment-list">` with one `<li class="comment">` per comment showing author name, `formatTimestamp(comment.created_at)`, and body text; for own comments (`canModifyComment(comment, currentUserId) === true`) render Edit and Delete `<button>` elements; Edit replaces the body text with an inline `<textarea>` + Save/Cancel buttons; Save calls `editComment(commentId, currentUserId, newBody)` then emits `COMMENT_UPDATED`; Delete calls `deleteComment(commentId, currentUserId)` then emits `COMMENT_UPDATED`; subscribe to `EventBus.on('COMMENT_UPDATED', rerender)` where rerender checks `event.taskId === taskId`; add a `<form class="comment-form">` at the bottom with a `<textarea>` + Submit button; empty body shows inline error, Submit calls `addComment(taskId, currentUserId, body)` then emits `COMMENT_UPDATED`; render "No comments yet" empty state when list is empty
- [x] T046 [US6] Implement `src/components/task-detail.js` exporting `createTaskDetail({ taskId, currentUserId, onClose })`: calls `getTask(taskId)`, renders a `<div class="task-detail">` inside a modal showing: task title, description (or "No description"), assignee name (or "Unassigned"), current column label, and `createCommentList({ taskId, currentUserId })`; a close `<button>` calls `onClose()`; focus is trapped inside the modal while open; Escape key calls `onClose()`
- [x] T047 [US6] Wire task detail in `src/components/kanban-column.js`: `onTaskClick(taskId)` handler calls `openModal(createTaskDetail({ taskId, currentUserId, onClose: closeModal }))` — `currentUserId` must be passed down from `kanban-board.js` through `kanban-column.js` to this call; update `createKanbanColumn` props to include `currentUserId`

**Checkpoint**: `npm run test:e2e -- us6` passes. Comments fully functional with ownership controls.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Verify all constitution requirements (performance, accessibility, observability, test coverage) and validate seed data integrity.

- [x] T048 [P] Run all 6 manual validation scenarios from `specs/001-kanban-board/quickstart.md` in a browser with a fresh OPFS state (use the browser console reset command from quickstart.md); document any failures as issues; fix all failures before merge
- [x] T049 [P] Verify WCAG 2.1 AA contrast ratios on all design token color pairs used in interactive elements (text on card backgrounds, text on buttons, text on column headers); use browser DevTools accessibility checker or axe; update `tokens.css` values for any non-compliant pairs
- [x] T050 [P] Verify keyboard navigation: tab through profile selector, project list, board header, task cards, task detail modal, comment list, and all form elements; confirm every interactive element is reachable and activatable via Enter or Space; fix any missing `tabindex`, `role`, or keyboard event handlers
- [x] T051 [P] Verify performance targets using browser DevTools Performance panel: (a) board view (including WASM init on cold start) is interactive in < 2 seconds; (b) drag-and-drop column move reflected in < 500 ms of drop; (c) task creation form submission appears in board in < 1 second; document actual measurements; fix WASM init path if > 2s (e.g. add more aggressive loading indicator or defer non-critical init)
- [x] T052 [P] Run `npm run test:coverage`; confirm line coverage ≥ 80% on `src/` files; add targeted unit tests in `tests/unit/` for any store function or utility with coverage below threshold (focus on ownership checks in `comments.js`, sort-order logic in `tasks.js`, and route-matching in `router.js`)
- [x] T053 Validate seed data integrity in browser: open all 3 sample projects and confirm each has between 5 and 15 tasks with at least one task in each of the 4 columns (To Do, In Progress, In Review, Done) per spec clarification recorded in `spec.md §Clarifications`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Requires Phase 1 complete — **BLOCKS all user stories**
- **US1 (Phase 3)**: Requires Foundational complete
- **US2 (Phase 4)**: Requires US1 complete (project list depends on app routing and session)
- **US3 (Phase 5)**: Requires US2 complete (drag-and-drop wires into board/column/card components)
- **US4 (Phase 6)**: Requires US2 complete (project form and member manager appear within the board/list views)
- **US5 (Phase 7)**: Requires US4 complete (task form needs member list from the project)
- **US6 (Phase 8)**: Requires US5 complete (task detail opens from task cards)
- **Polish (Final)**: Requires all user stories complete

### User Story Dependencies

```
US1 → US2 ──┬──→ US3 (wires into board)
             └──→ US4 → US5 → US6
```

### Within Each User Story

- E2E tests MUST be written and confirmed failing before any implementation task in that story
- Within implementation: utilities/stores before components; inner components before outer components
- Each story is complete only when its E2E checkpoint passes

---

## Parallel Opportunities

### Phase 2 — Foundational (maximum parallelism)

```
Parallel batch A (no inter-dependencies):
  T005 id.js
  T006 time.js
  T007 dom.js
  T008 event-bus.js
  T009 dnd.js
  T010 router.js
  T011 modal.js

Sequential after all utilities:
  T012 Integration tests (write first, confirm failing)
  T013 database.js
  T014 migrations.js

Parallel after T014:
  T015 seed-data.js
  T017 users.js store
  T018 projects.js store
  T020 comments.js store

Sequential after T015 + stores:
  T016 seed.js
  T019 tasks.js store (depends on enriched query design, confirm after stores)

Parallel after T014:
  T021 loading-screen.js

Sequential last:
  T022 main.js bootstrap
```

### Phase 4 — US2 (parallel within story)

```
Parallel:
  T026 E2E test (write and confirm failing)
  T031 Component CSS styles

Sequential after T026 confirmed failing:
  T027 project-list.js
  T028 kanban-board.js (depends on column)
  T029 kanban-column.js
  T030 task-card.js
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (**CRITICAL** — blocks everything)
3. Complete Phase 3: US1 — Profile Selection
4. **STOP AND VALIDATE**: Run `npm run test:e2e -- us1`; demo profile selector in browser
5. Deploy/share if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Profile selection working → Demo
3. Add US2 → Board view with sample data → Demo (most visually impressive milestone)
4. Add US3 → Drag and drop working → Demo
5. Add US4 → Project creation + members → Demo
6. Add US5 → Task creation → Demo
7. Add US6 → Comments → Demo
8. Polish → Ship

### Parallel Team Strategy (2 developers)

After Phase 2 (Foundational) is complete:

- Developer A: US1 → US2 → US3 (core board experience)
- Developer B: US4 → US5 → US6 (creation + collaboration features)

Both merge to main after their checkpoints pass. US3 and US5 can be integrated independently — no shared components conflict.

---

## Notes

- `[P]` tasks = different files, no dependencies — safe to implement simultaneously
- `[USN]` label maps task to user story for traceability
- E2E tests MUST be written before implementation — confirm they fail, then implement
- Each user story checkpoint (verify E2E tests pass) is a hard gate before the next story
- After every store mutation (`createProject`, `createTask`, `moveTask`, `addComment`, etc.), the relevant `EventBus.emit()` call triggers component re-renders — verify this chain works before marking the story complete
- OPFS database resets for testing: use the browser console command from `quickstart.md`
- All store functions are synchronous after `initDatabase()` resolves (opfs-sahpool VFS provides sync API via SharedArrayBuffer + Atomics); `initDatabase()` itself is async
- For constitution compliance: every PR must pass the review checklist in `.specify/memory/constitution.md §Principle Application in Code Reviews`
