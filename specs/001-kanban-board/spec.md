# Feature Specification: Taskify Kanban Board Platform

**Feature Branch**: `001-kanban-board`

**Created**: 2026-06-25

**Status**: Draft

**Input**: User description: "Develop Taskify, a team productivity platform. It should allow
users to create projects, add team members, assign tasks, comment and move tasks between boards
in Kanban style. Five predefined users: one product manager and four engineers. Three sample
projects. Standard Kanban columns: To Do, In Progress, In Review, Done. No login required for
this version. Users pick their profile on launch. Drag and drop cards between columns. Tasks
assigned to the current user appear in a different color. Users can edit/delete their own
comments but not others'."

## Clarifications

### Session 2026-06-26

- Q: How many tasks should each sample project contain, and how should they be distributed across columns? → A: Each sample project must have between 5 and 15 tasks, randomly distributed across all four columns, with at least one task in each column (To Do, In Progress, In Review, Done).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Profile Selection on Launch (Priority: P1)

When the application opens, a user is presented with a profile selection screen showing all five
predefined team members — one product manager and four engineers. The user clicks their name/avatar
to identify themselves for the session. No password or authentication is required. After selecting
a profile, the user lands on the project list view.

**Why this priority**: Without profile selection, nothing else in the application is possible. It
establishes the current user identity that drives task highlighting, comment ownership, and
assignment logic throughout the session.

**Independent Test**: Open the app, verify the profile selection screen appears with five distinct
user profiles. Select one profile and confirm the app transitions to the project list with that
user's name visible in the interface.

**Acceptance Scenarios**:

1. **Given** the application has just loaded, **When** the profile selection screen appears,
   **Then** all five predefined user profiles are displayed with their names and roles visible.
2. **Given** the profile selection screen is shown, **When** a user clicks on a profile,
   **Then** the app transitions to the main project list, and the selected user's name is
   displayed as the active user.
3. **Given** a user has selected a profile and is in the app, **When** they want to switch
   profiles, **Then** there is a way to return to profile selection (e.g., from a menu or header
   control), and selecting a new profile updates the active user throughout the app immediately.

---

### User Story 2 - View Project List and Kanban Board (Priority: P2)

After selecting a profile, the user sees a list of all projects. Selecting a project opens its
Kanban board, which displays tasks organized into four columns: To Do, In Progress, In Review, and
Done. Each task card shows at minimum its title and assignee. Tasks assigned to the currently
active user are visually distinguished from tasks assigned to others (different background color
or accent).

**Why this priority**: Viewing the board is the core read experience. Even without creating or
moving tasks, a team member must be able to see the current state of a project. This story
delivers observable value by itself.

**Independent Test**: Pre-populate the three sample projects with tasks in various columns. Select
any profile, navigate to a project, and verify: all four columns appear, task cards are in the
correct column, and tasks assigned to the selected user appear in a distinct color vs. tasks
assigned to others.

**Acceptance Scenarios**:

1. **Given** a user has selected a profile, **When** they view the project list, **Then** all
   three sample projects are listed with their names visible.
2. **Given** a user opens a project, **When** the Kanban board loads, **Then** four columns
   appear in order: To Do, In Progress, In Review, Done.
3. **Given** tasks exist in a project, **When** a user views the board, **Then** each task card
   displays at minimum its title and the name of its assignee.
4. **Given** the active user has tasks assigned to them in a project, **When** they view the
   board, **Then** those task cards appear in a visually distinct color compared to tasks
   assigned to other users.
5. **Given** the active user has no tasks in a project, **When** they view the board, **Then**
   all task cards appear in the default (non-highlighted) color.

---

### User Story 3 - Drag and Drop Tasks Between Columns (Priority: P3)

A user drags a task card from one Kanban column and drops it into a different column. The task
immediately reflects its new status in the updated column. Any team member can move any task
regardless of assignment.

**Why this priority**: Moving tasks is the core workflow interaction for a Kanban board. Without
it, status tracking requires workarounds and the board delivers far less value.

**Independent Test**: Open a project board, drag a task from "To Do" to "In Progress," and verify
it appears in "In Progress" and no longer appears in "To Do." Repeat across all column transitions
(including non-adjacent moves, e.g., To Do → Done).

**Acceptance Scenarios**:

1. **Given** a task is in the "To Do" column, **When** a user drags and drops it into "In Progress,"
   **Then** the task card appears in "In Progress" and is removed from "To Do."
2. **Given** a user drags a task, **When** they hover over a valid drop target (a column),
   **Then** the column provides visual feedback indicating it will accept the drop.
3. **Given** a user starts dragging a task but releases it outside any valid column, **When**
   the drag is cancelled, **Then** the task returns to its original column unchanged.
4. **Given** any user is active, **When** they drag a task they are not assigned to,
   **Then** the move succeeds — any team member can move any task.

---

### User Story 4 - Create Projects and Manage Team Members (Priority: P4)

Any user can create a new project by providing a project name. After creation, the user can add
any of the five predefined team members to the project. Team members listed in a project can see
and interact with that project's board. Projects can also be created from scratch alongside the
three sample projects.

**Why this priority**: New project creation and team composition are management actions that set
up the workspace for collaboration. They build on the board view (P2) and enable future stories
around task creation.

**Independent Test**: Create a new project named "Test Sprint," add two team members, then verify
the project appears in the project list and those two members are listed as project participants.

**Acceptance Scenarios**:

1. **Given** a user is on the project list, **When** they initiate project creation and provide a
   name, **Then** the new project appears in the project list.
2. **Given** a project exists, **When** a user opens the project's member management,
   **Then** they can see all current project members.
3. **Given** a project exists, **When** a user adds a predefined team member to the project,
   **Then** that member is listed as a project participant.
4. **Given** a project has members, **When** a user removes a member from the project,
   **Then** that member no longer appears in the project's member list.
5. **Given** a new project is created, **When** a user opens its Kanban board, **Then** the four
   standard columns (To Do, In Progress, In Review, Done) are present and empty.

---

### User Story 5 - Create and Assign Tasks (Priority: P5)

A user creates a new task within a project by providing at minimum a title. They can optionally
add a description and assign the task to one of the project's team members. New tasks default to
the "To Do" column. Any project member can create tasks and assign them to any other project member.

**Why this priority**: Task creation is the primary content-generating action. Without it, the
board only shows sample data and cannot reflect real work.

**Independent Test**: Open a project, create a task titled "Design login screen," assign it to the
engineer "Alex," and verify the task appears in the "To Do" column with Alex's name and that it is
highlighted when Alex's profile is active.

**Acceptance Scenarios**:

1. **Given** a user is viewing a project board, **When** they create a task with only a title,
   **Then** the task appears in the "To Do" column.
2. **Given** a user creates a task, **When** they assign it to a project member, **Then** the
   task card displays that member's name as the assignee.
3. **Given** a task is assigned to the active user, **When** the task appears on the board,
   **Then** it is displayed in the "current user" highlight color (per US2 rules).
4. **Given** a user creates a task with a title and description, **When** they open the task
   detail view, **Then** both the title and description are displayed.
5. **Given** a user creates a task without assigning it, **When** the task appears on the board,
   **Then** the assignee field shows "Unassigned" or equivalent.

---

### User Story 6 - Comment on Tasks (Priority: P6)

A user opens a task detail view and adds a comment. All comments on a task are visible to any
user who can access the project. The comment shows the author's name and the time it was posted.
Users can edit or delete their own comments. Users cannot edit or delete comments written by
other team members.

**Why this priority**: Comments are the communication layer on top of the task workflow. They
depend on tasks (P5) and profile identity (P1) being established first.

**Independent Test**: As user "Jordan," open a task and post a comment. Verify Jordan's comment
shows her name. Switch to user "Alex" and verify Alex can see Jordan's comment but cannot edit or
delete it. As Alex, add a new comment, then verify Alex can edit and delete his own comment.

**Acceptance Scenarios**:

1. **Given** a user opens a task, **When** they submit a comment, **Then** the comment appears in
   the task detail with the active user's name and a timestamp.
2. **Given** a task has multiple comments, **When** a user views the task, **Then** all comments
   are visible in chronological order.
3. **Given** a user views their own comment, **When** they choose to edit it, **Then** the comment
   text becomes editable and the updated text is saved on confirmation.
4. **Given** a user views their own comment, **When** they choose to delete it, **Then** the
   comment is removed from the task.
5. **Given** a user views a comment authored by a different team member, **When** they view the
   comment, **Then** no edit or delete controls are visible or accessible for that comment.

---

### Edge Cases

- What happens when a user tries to create a project with an empty name?
- What happens when a task has no assignee and is viewed by any user (should appear in default color)?
- What happens when a user drags a task card to the same column it is already in?
- What happens when a task has no comments and the detail view is opened?
- What happens when a user edits a comment and submits an empty string?
- What happens when all five predefined users are added to a project (full-team membership)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present a profile selection screen on application launch showing all
  five predefined users (one product manager, four engineers) with their names and roles.
- **FR-002**: System MUST allow any user to select their profile without credentials or
  authentication, and maintain that identity for the duration of the session.
- **FR-003**: System MUST provide a mechanism to switch the active user profile without
  restarting the application.
- **FR-004**: System MUST display a project list showing all projects accessible in the application.
- **FR-005**: System MUST display a Kanban board for each project with exactly four columns in
  this order: To Do, In Progress, In Review, Done.
- **FR-006**: System MUST display task cards in each column with at minimum the task title and
  assignee name visible on the card.
- **FR-007**: System MUST visually distinguish task cards assigned to the currently active user
  from all other task cards (e.g., via background color or color accent).
- **FR-008**: System MUST support drag-and-drop of task cards between columns, with visual
  feedback during the drag operation.
- **FR-009**: System MUST update a task's column immediately and persistently when it is dropped
  into a new column.
- **FR-010**: System MUST allow any project member to move any task card regardless of who the
  task is assigned to.
- **FR-011**: System MUST allow any user to create a new project by providing a project name.
- **FR-012**: System MUST allow users to add any of the five predefined team members to a project.
- **FR-013**: System MUST allow users to remove team members from a project.
- **FR-014**: System MUST allow any project member to create a new task within a project,
  requiring at minimum a title; description and assignee are optional.
- **FR-015**: System MUST place newly created tasks in the "To Do" column by default.
- **FR-016**: System MUST allow the task creator to assign a task to any project member, or
  leave it unassigned.
- **FR-017**: System MUST provide a task detail view showing the task title, description, assignee,
  current column/status, and all comments.
- **FR-018**: System MUST allow any project member to add a comment to any task.
- **FR-019**: System MUST display each comment with the author's name and a timestamp.
- **FR-020**: System MUST allow a user to edit only their own comments.
- **FR-021**: System MUST allow a user to delete only their own comments.
- **FR-022**: System MUST NOT display edit or delete controls on comments authored by other users.
- **FR-023**: System MUST include three pre-populated sample projects, each with between 5 and
  15 tasks distributed across all four Kanban columns, with at least one task in each column
  (To Do, In Progress, In Review, Done).

### Key Entities

- **User**: A predefined team member. Attributes: name, role (Product Manager or Engineer),
  avatar or initials. Five users total, fixed — not user-created.
- **Project**: A workspace grouping related tasks. Attributes: name, list of member users.
  Members determine who participates in the project.
- **Task**: A unit of work within a project. Attributes: title, description (optional), assignee
  (a User or unassigned), current column/status, creation timestamp. Tasks belong to exactly
  one project.
- **Column**: One of four fixed status stages — To Do, In Progress, In Review, Done. Columns
  are not configurable; every project has the same four columns.
- **Comment**: A message on a task. Attributes: author (a User), text, created timestamp,
  last-edited timestamp. Comments belong to exactly one task.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can select a profile and navigate to a project's Kanban board within
  3 interactions (profile click → project click → board visible).
- **SC-002**: Dragging a task card and dropping it into a new column completes the status
  update seamlessly and the card appears in its new column within 1 second of release, with
  no interruption to the user's view of the board.
- **SC-003**: All five user profiles are available on the launch screen with zero configuration
  required by the end user.
- **SC-004**: All three sample projects are immediately accessible after profile selection, each
  with between 5 and 15 tasks pre-distributed across all four columns, with at least one task
  in each column.
- **SC-005**: A user can create a new task (title only) and see it on the board in the "To Do"
  column within 2 interactions (open create form → submit).
- **SC-006**: A user can add a comment to a task and see it appear in the task detail within
  1 interaction (submit comment).
- **SC-007**: Edit and delete controls are visible on a user's own comments and absent on all
  other users' comments — verified across all five user profiles without exception.
- **SC-008**: Tasks assigned to the active user are visually distinguishable at a glance on the
  board; a tester can identify them without reading the assignee name.

## Assumptions

- All data (users, projects, tasks, comments, column positions) is persisted in the browser's
  local storage or an equivalent client-side mechanism, so state survives page refresh within
  the same browser session. No server-side backend is in scope for this version.
- "Adding a team member to a project" means selecting from the five predefined users. There is
  no ability to create new users in this version.
- Task priority, due dates, labels/tags, and file attachments are out of scope for this version.
- The application targets desktop/laptop browsers; mobile-responsive design is a nice-to-have but
  not a mandatory requirement for this version.
- All five predefined users are available to be added to any project, regardless of whether they
  are already members of other projects.
- The product manager and engineers have identical capabilities within the application — there are
  no role-based permission restrictions (the PM role is informational only in this version).
- Switching user profiles mid-session does not require confirmation; the switch takes effect
  immediately.
- Task cards on the board show a condensed view (title + assignee); full details including
  description and comments are accessed via a task detail view (e.g., a modal or side panel).
- The three sample projects and their tasks are seeded as initial data when the app first loads
  (i.e., if local storage is empty). Re-seeding on each load is not required. Each sample project
  must seed between 5 and 15 tasks with at least one task placed in each of the four columns.
