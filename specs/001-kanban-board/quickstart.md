# Quickstart & Validation Guide: Taskify Kanban Board Platform

**Feature**: 001-kanban-board
**Date**: 2026-06-26

This guide describes how to install, run, and manually validate the application. Use it to
confirm each user story works end-to-end before marking the feature complete.

---

## Prerequisites

- Node.js 20 or later
- A modern desktop browser (Chrome 120+, Firefox 120+, or Safari 17+)
  - OPFS (Origin Private File System) support required for SQLite persistence
  - SharedArrayBuffer required (enforced by COOP/COEP headers configured in Vite)

---

## Install & Run

```bash
# From the repository root
npm install
npm run dev
```

The Vite dev server starts at `http://localhost:5173`. Open it in a desktop browser.

**Note on headers**: The Vite config must emit `Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Embedder-Policy: require-corp` for OPFS to work. Verify these appear in the
browser's Network tab on the first request.

---

## Running Tests

```bash
# Unit and integration tests (Vitest)
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# End-to-end tests (Playwright — requires dev server running)
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

All tests must pass before any merge to main.

---

## Manual Validation Scenarios

Work through each scenario in order. Each scenario maps to a user story in
[spec.md](spec.md).

---

### Scenario 1 — Profile Selection on Launch (US1, P1)

1. Open `http://localhost:5173` in a fresh browser session.
2. **Verify**: The profile selection screen appears immediately (no blank state, no error).
3. **Verify**: All 5 predefined profiles are shown with name and role visible:
   - Alex Chen — Product Manager
   - Jordan Rivera — Engineer
   - Sam Park — Engineer
   - Taylor Kim — Engineer
   - Morgan Lee — Engineer
4. Click **Alex Chen**.
5. **Verify**: The app transitions to the project list. Alex Chen's name is visible in the
   header or profile indicator.
6. From the header, find the profile-switch control and use it to return to profile selection.
7. **Verify**: The profile selection screen appears again.
8. Select **Morgan Lee**.
9. **Verify**: The app shows the project list with Morgan Lee as the active user.

✅ **Pass criteria**: All 5 profiles displayed; selecting one loads the project list with the
correct user shown; profile can be switched without restart.

---

### Scenario 2 — View Project List and Kanban Board (US2, P2)

*Prerequisite: Logged in as any user (all 5 are members of all 3 sample projects).*

1. **Verify**: The project list shows all 3 sample projects:
   - Mobile App Redesign
   - API Integration Sprint
   - Q3 Platform Release
2. Click **Mobile App Redesign**.
3. **Verify**: The Kanban board loads with 4 columns in order: To Do | In Progress | In Review | Done.
4. **Verify**: Task cards are visible in the correct columns (see data-model.md seed table).
5. **Verify**: Each card shows at minimum the task title and assignee name.
6. Log in as **Jordan Rivera**, then open **Mobile App Redesign**.
7. **Verify**: The task "Implement new navigation bar" (assigned to Jordan Rivera) appears in
   a distinct highlight color compared to other cards.
8. Log in as **Alex Chen**, open **Mobile App Redesign**.
9. **Verify**: "Implement new navigation bar" is in the default color (not Alex's color).
   "Define new color palette" (assigned to Alex) appears highlighted.

✅ **Pass criteria**: 3 projects listed; 4 columns in correct order; current-user tasks
highlighted; other tasks in default color.

---

### Scenario 3 — Drag and Drop Between Columns (US3, P3)

1. Open **API Integration Sprint** board as any user.
2. Find a task in **To Do** (e.g., "Error mapping and user messages").
3. Drag it to **In Progress**.
4. **Verify**: The card appears in In Progress within 1 second. It no longer appears in To Do.
5. **Verify**: A visual indicator (column highlight/outline) appears while hovering the drag
   over a valid target column.
6. Drag the same task back to **To Do**.
7. **Verify**: The card returns to To Do.
8. Drag a task and release it outside any column (e.g., over the page header).
9. **Verify**: The task returns to its original column unchanged.
10. Drag a task not assigned to the current user.
11. **Verify**: The move succeeds (any user can move any task).
12. Refresh the page.
13. **Verify**: All column positions are preserved (OPFS persistence confirmed).

✅ **Pass criteria**: Cards move between columns; visual feedback during drag; cancel on
invalid drop; positions persist after refresh.

---

### Scenario 4 — Create Projects and Manage Members (US4, P4)

1. From the project list as **Taylor Kim**, click **New Project**.
2. Enter the name "Performance Testing Sprint" and submit.
3. **Verify**: The new project appears in the project list.
4. Open the new project. **Verify**: The board has 4 empty columns.
5. Open member management for the project.
6. **Verify**: Taylor Kim is NOT listed as a member yet (or IS, depending on whether the
   creator is auto-added — note assumption in spec: creator must be added explicitly).
7. Add **Jordan Rivera** as a member. **Verify**: Jordan appears in the members list.
8. Add all 5 users. **Verify**: All 5 are listed as members.
9. Remove **Sam Park**. **Verify**: Sam no longer appears in the members list.
10. Attempt to create a project with an empty name.
11. **Verify**: An error message appears; no project is created.

✅ **Pass criteria**: Project creation works; members can be added/removed; empty name is rejected.

---

### Scenario 5 — Create and Assign Tasks (US5, P5)

1. Open **Performance Testing Sprint** (created in Scenario 4) as **Alex Chen**.
2. Click **Add Task**.
3. Enter title "Set up load testing environment" only (no description, no assignee). Submit.
4. **Verify**: The task appears in the **To Do** column. Assignee shows "Unassigned".
5. Click **Add Task** again.
6. Enter title "Write test scripts", description "Cover all critical endpoints", assign to
   **Morgan Lee**. Submit.
7. **Verify**: The task appears in To Do with Morgan Lee's name.
8. Switch to **Morgan Lee** profile.
9. **Verify**: "Write test scripts" now appears in the highlight color on the board.
10. Attempt to add a task with an empty title.
11. **Verify**: An error message appears; the task is not created.

✅ **Pass criteria**: Tasks created in To Do; optional fields respected; assignee highlighting
works; empty title rejected.

---

### Scenario 6 — Comment on Tasks (US6, P6)

1. Open any task detail (e.g., click on "Set up load testing environment").
2. As **Alex Chen**, enter "We should use k6 for this." and submit the comment.
3. **Verify**: The comment appears with "Alex Chen" and a timestamp.
4. **Verify**: Edit and Delete buttons are visible on Alex's comment.
5. Switch to **Jordan Rivera** profile. Open the same task detail.
6. **Verify**: Alex's comment is visible.
7. **Verify**: No Edit or Delete controls appear on Alex's comment.
8. As **Jordan Rivera**, add the comment "Agreed, k6 is lightweight."
9. **Verify**: Jordan's comment appears below Alex's (chronological order).
10. **Verify**: Jordan's comment has Edit/Delete; Alex's comment does not.
11. As Jordan, click **Edit** on "Agreed, k6 is lightweight." Change it to "Agreed, k6 is our best option."
12. **Verify**: The updated text is saved and displayed.
13. As Jordan, click **Delete** on the comment.
14. **Verify**: The comment is removed from the task detail.
15. Attempt to submit an empty comment.
16. **Verify**: An error message appears; the comment is not posted.

✅ **Pass criteria**: Comments show author + timestamp; own comments have edit/delete controls;
other comments do not; edit saves correctly; delete removes comment; empty comment rejected.

---

## Seed Data Verification

After first launch (fresh OPFS), verify sample data integrity:

| Project | Expected task count | All 4 columns populated |
|---------|--------------------|-----------------------|
| Mobile App Redesign | 10 | ✅ |
| API Integration Sprint | 8 | ✅ |
| Q3 Platform Release | 12 | ✅ |

Check that each column has at least 1 task across all 3 projects. Exact counts are in
[data-model.md](data-model.md).

---

## Resetting State

To clear all data and re-seed from scratch (useful during development):

```js
// In the browser console:
const root = await navigator.storage.getDirectory();
await root.removeEntry('taskify.db', { recursive: false });
location.reload();
```

This deletes the OPFS database file. On next load, `seedIfEmpty()` re-creates all sample data.
