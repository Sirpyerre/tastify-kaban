# Data Model: Taskify Kanban Board Platform

**Feature**: 001-kanban-board
**Date**: 2026-06-26
**Storage**: SQLite via `@sqlite.org/sqlite-wasm` + OPFS (browser-local)

---

## Entities Overview

```
User (5, pre-seeded, immutable)
 │
 ├── project_members (M:N join)
 │        │
 │        ▼
 │      Project (user-created + 3 sample)
 │        │
 │        └── Task (per project)
 │              │
 │              └── Comment (per task)
 └── (assignee_id on Task, author_id on Comment)
```

---

## Schema

### Table: `users`

Predefined, seeded on first launch. Not user-editable.

```sql
CREATE TABLE IF NOT EXISTS users (
  id       TEXT PRIMARY KEY,
  name     TEXT NOT NULL,
  role     TEXT NOT NULL CHECK (role IN ('product_manager', 'engineer')),
  initials TEXT NOT NULL
);
```

| Field    | Type | Constraints | Notes |
|----------|------|-------------|-------|
| id       | TEXT | PK          | UUID (`crypto.randomUUID()`) |
| name     | TEXT | NOT NULL    | Full display name |
| role     | TEXT | NOT NULL, CHECK | `'product_manager'` or `'engineer'` |
| initials | TEXT | NOT NULL    | 2-letter initials for avatar fallback |

**Seed data** (5 users, fixed IDs so sample project foreign keys resolve):

| id | name | role | initials |
|----|------|------|----------|
| `user-pm-1` | Alex Chen | product_manager | AC |
| `user-eng-1` | Jordan Rivera | engineer | JR |
| `user-eng-2` | Sam Park | engineer | SP |
| `user-eng-3` | Taylor Kim | engineer | TK |
| `user-eng-4` | Morgan Lee | engineer | ML |

---

### Table: `projects`

```sql
CREATE TABLE IF NOT EXISTS projects (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL CHECK (length(trim(name)) > 0),
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```

| Field      | Type    | Constraints | Notes |
|------------|---------|-------------|-------|
| id         | TEXT    | PK          | UUID |
| name       | TEXT    | NOT NULL, non-empty | Project display name |
| created_at | INTEGER | NOT NULL    | Unix timestamp (seconds) |

**Validation rule**: `name` after trimming must be non-empty (enforced at DB level via CHECK
and at application level before insert).

---

### Table: `project_members`

Many-to-many join between projects and users. Controls which users can see and interact with a
project (members-only visibility — assumed per constitution Principle III; see research.md §6).

```sql
CREATE TABLE IF NOT EXISTS project_members (
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id),
  PRIMARY KEY (project_id, user_id)
);
```

| Field      | Type | Constraints | Notes |
|------------|------|-------------|-------|
| project_id | TEXT | PK (composite), FK → projects | Cascade delete with project |
| user_id    | TEXT | PK (composite), FK → users | User must exist |

**Business rule**: A user can only access a project if a `project_members` row exists for
`(project_id, user_id)`. No row = no access, no visibility.

---

### Table: `tasks`

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id          TEXT PRIMARY KEY,
  project_id  TEXT    NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT,
  assignee_id TEXT    REFERENCES users(id) ON DELETE SET NULL,
  column_key  TEXT    NOT NULL DEFAULT 'todo'
              CHECK (column_key IN ('todo', 'in_progress', 'in_review', 'done')),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_column
  ON tasks(project_id, column_key, sort_order);
```

| Field       | Type    | Constraints | Notes |
|-------------|---------|-------------|-------|
| id          | TEXT    | PK          | UUID |
| project_id  | TEXT    | NOT NULL, FK → projects | Cascade delete |
| title       | TEXT    | NOT NULL, non-empty | Required field |
| description | TEXT    | NULL allowed | Optional detail |
| assignee_id | TEXT    | NULL allowed, FK → users | SET NULL on user delete (future-proof) |
| column_key  | TEXT    | NOT NULL, CHECK | One of four fixed values |
| sort_order  | INTEGER | NOT NULL    | Insertion order within column; reserved for future reordering |
| created_at  | INTEGER | NOT NULL    | Unix timestamp |

**Column key mapping**:
| column_key   | Display label |
|--------------|---------------|
| `todo`       | To Do         |
| `in_progress`| In Progress   |
| `in_review`  | In Review     |
| `done`       | Done          |

**State transitions** (no restrictions — any column_key → any column_key is valid):
```
todo ↔ in_progress ↔ in_review ↔ done
  └───────────── any direction ─────────────┘
```

**sort_order assignment**: On task creation, `sort_order = MAX(sort_order) + 1` within the same
`(project_id, column_key)` group. On move, sort_order is set to `MAX(sort_order) + 1` in the
target column.

---

### Table: `comments`

```sql
CREATE TABLE IF NOT EXISTS comments (
  id         TEXT    PRIMARY KEY,
  task_id    TEXT    NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id  TEXT    NOT NULL REFERENCES users(id),
  body       TEXT    NOT NULL CHECK (length(trim(body)) > 0),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_comments_task
  ON comments(task_id, created_at);
```

| Field      | Type    | Constraints | Notes |
|------------|---------|-------------|-------|
| id         | TEXT    | PK          | UUID |
| task_id    | TEXT    | NOT NULL, FK → tasks | Cascade delete |
| author_id  | TEXT    | NOT NULL, FK → users | Immutable after creation |
| body       | TEXT    | NOT NULL, non-empty | Comment text; cannot be blank on edit |
| created_at | INTEGER | NOT NULL    | Set on insert, never updated |
| updated_at | INTEGER | NOT NULL    | Updated on every edit |

**Ownership rule**: `author_id` is set at creation and MUST NOT be changed. Edit/delete
operations MUST verify `author_id = current_user_id` before proceeding. This check is enforced
at the application layer (not DB-level, since the DB has no session concept).

---

## Additional Index

```sql
CREATE INDEX IF NOT EXISTS idx_project_members_user
  ON project_members(user_id);
```

Used by `getProjectsForUser(userId)` to filter the project list efficiently.

---

## Sample Seed Data

Three sample projects are seeded when the database is first initialized (OPFS file does not yet
exist). Each project has all 5 users as members. Tasks are distributed across all four columns
with at least one per column.

### Project 1: "Mobile App Redesign"

10 tasks across 4 columns.

| Title | Column | Assignee |
|-------|--------|----------|
| Define new color palette | done | Alex Chen (PM) |
| User research interviews | done | Jordan Rivera |
| Wireframe home screen | done | Sam Park |
| Prototype onboarding flow | in_review | Taylor Kim |
| Accessibility audit | in_review | Morgan Lee |
| Implement new navigation bar | in_progress | Jordan Rivera |
| Update typography system | in_progress | Sam Park |
| Revise icon set | in_progress | Taylor Kim |
| Write design handoff docs | todo | Morgan Lee |
| QA visual regression tests | todo | Alex Chen (PM) |

### Project 2: "API Integration Sprint"

8 tasks across 4 columns.

| Title | Column | Assignee |
|-------|--------|----------|
| Document third-party API specs | done | Alex Chen (PM) |
| Set up sandbox environment | done | Jordan Rivera |
| Implement authentication flow | in_review | Sam Park |
| Write contract tests for endpoints | in_review | Taylor Kim |
| Build data transformation layer | in_progress | Morgan Lee |
| Handle rate-limit retry logic | in_progress | Jordan Rivera |
| Error mapping and user messages | todo | Sam Park |
| Integration smoke test suite | todo | Taylor Kim |

### Project 3: "Q3 Platform Release"

12 tasks across 4 columns.

| Title | Column | Assignee |
|-------|--------|----------|
| Release planning kickoff | done | Alex Chen (PM) |
| Feature freeze confirmed | done | Alex Chen (PM) |
| Performance baseline captured | done | Morgan Lee |
| Staging environment validated | done | Jordan Rivera |
| Fix memory leak in task list | in_review | Sam Park |
| Update changelog for v3.0 | in_review | Taylor Kim |
| Load testing under peak traffic | in_progress | Morgan Lee |
| Database migration dry run | in_progress | Jordan Rivera |
| Rollback procedure documented | in_progress | Sam Park |
| Security scan on new endpoints | todo | Taylor Kim |
| Deploy to production | todo | Alex Chen (PM) |
| Post-release monitoring checklist | todo | Morgan Lee |

---

## Migrations

Schema is created via a single migration function at database init time. The schema version is
stored in SQLite's `user_version` pragma:

```sql
PRAGMA user_version = 1;
```

If `user_version = 0` on open, run migration 1 (full schema creation + seed). Future migrations
increment the pragma value and apply their DDL changes.

---

## Entity Lifecycle Summary

| Entity  | Created by | Deleted by | Immutable fields |
|---------|------------|------------|-----------------|
| User    | Seed only  | Never      | id, name, role, initials |
| Project | Any user   | Never (v1) | id, created_at |
| Task    | Project member | Never (v1) | id, project_id, created_at |
| Comment | Project member | Author only | id, task_id, author_id, created_at |

> **v1 note**: Task and project deletion are out of scope per spec assumptions. The schema supports
> cascade deletes for future versions.
