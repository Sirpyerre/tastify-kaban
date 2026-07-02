# Implementation Plan: Taskify Kanban Board Platform

**Branch**: `001-kanban-board` | **Date**: 2026-06-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-kanban-board/spec.md`

---

## Summary

Build Taskify: a client-side-only Kanban board platform for a fixed team of 5 predefined users.
The application is a single-page web app built with Vite and vanilla HTML/CSS/JavaScript. All
state is persisted in a local SQLite database (via `@sqlite.org/sqlite-wasm` + OPFS). Users
select their profile on launch (no authentication). Three sample projects are pre-seeded with
tasks distributed across all four Kanban columns. Task cards assigned to the active user are
highlighted. Drag and drop (native HTML5 DnD API) moves tasks between columns. Users can
create projects, manage team membership, create and assign tasks, and comment on tasks — with
edit/delete controls limited to a user's own comments.

---

## Technical Context

**Language/Version**: JavaScript (ES2022+), no TypeScript

**Primary Dependencies**:
- `vite` — build tool and dev server
- `@sqlite.org/sqlite-wasm` — SQLite running in-browser via WASM + OPFS persistence
- `vitest` — unit and integration test runner
- `@playwright/test` — end-to-end test runner
- All other functionality: vanilla browser APIs (Drag and Drop, `crypto.randomUUID()`,
  `Intl.DateTimeFormat`, `hashchange`, OPFS via `navigator.storage`)

**Storage**: SQLite via `@sqlite.org/sqlite-wasm`; database file persisted in OPFS
(Origin Private File System — browser-private, survives page refresh and browser restart)

**Testing**:
- Unit/integration: Vitest
- E2E: Playwright (against Vite dev server)
- Coverage: Vitest coverage with v8 provider; 80% floor on new code (constitution Principle II)

**Target Platform**: Desktop browsers — Chrome 120+, Firefox 120+, Safari 17+
(OPFS + SharedArrayBuffer support required; mobile explicitly out of scope per spec)

**Project Type**: Single-page web application (SPA, client-side only, no backend)

**Performance Goals** (per constitution Principle V):
- Board/list views interactive within 2 seconds (including WASM init on first load)
- Drag-and-drop column move reflected within 500 ms of drop event
- Form submissions (task create, comment post) reflected within 1 second
- Main thread not blocked longer than 50 ms on any user interaction

**Constraints**:
- No server-side backend; all logic runs in-browser
- No image uploads (per user input)
- No authentication (profile selection only)
- COOP/COEP headers required for OPFS/SharedArrayBuffer — must be configured in Vite and
  any production server
- No external UI library; vanilla CSS + BEM + CSS custom properties for all styling
- Mobile support is out of scope for v1

**Scale/Scope**: 5 users, up to ~50 sample tasks (3 projects × ≤15 tasks), user-created data
grows incrementally; localStorage equivalent data volume at this scale

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. API-First Design | ✅ PASS | Module contracts defined in `contracts/` before any implementation. Internal JS module interfaces serve as the API surface. Waiver applied for pure UI-internal drag ghost state (constitution allows waiver for UI-internal state). |
| II. Testing Standards | ✅ PASS | TDD enforced. Unit tests: business logic and store functions. Integration tests: SQLite CRUD via Vitest. E2E tests: all 6 user stories via Playwright. 80% coverage floor configured. |
| III. Team-Centric Data Model | ✅ PASS | All tasks scoped to projects; all comments scoped to tasks within projects. `project_members` join table enforces members-only project visibility (assumed per constitution; Q1 from clarification session still formally open — see Complexity Tracking). |
| IV. Code Quality | ✅ PASS | ES modules with single-responsibility per file. BEM CSS naming. `crypto.randomUUID()` for IDs. No abbreviations in module/function names. |
| V. Performance & Observability | ✅ PASS with mitigation | WASM init adds ~200–400 ms overhead on cold start. Mitigation: show a loading screen during init; init begins immediately on page load before any user interaction. Structured `console.info` / `console.error` logs for all DB operations and key user actions (no server-side logging — client-side app). |
| VI. User Experience Consistency | ✅ PASS | Design tokens in `src/styles/tokens.css` established before any UI work. Loading, empty, and error states implemented for all views. WCAG 2.1 AA contrast and keyboard navigation required for all interactive elements. |

**Post-design re-check**: Required after Phase 1 artifacts are complete. Update this table with
any findings from reviewing `data-model.md` and `contracts/` against the constitution.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-kanban-board/
├── plan.md              # This file
├── research.md          # Phase 0: technology decisions and rationale
├── data-model.md        # Phase 1: SQLite schema, seed data, entity lifecycle
├── quickstart.md        # Phase 1: validation guide and manual test scenarios
├── contracts/
│   ├── database.md      # DB module contracts (initDatabase, query, execute, transaction)
│   ├── stores.md        # Store module contracts (users, projects, tasks, comments)
│   ├── components.md    # Component contracts (factory functions → HTMLElement)
│   └── utilities.md     # Utility contracts (router, dnd, id, time, dom)
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (generated by /speckit-tasks)
```

### Source Code (repository root)

```text
index.html               # Entry point — single HTML file
vite.config.js           # Vite config (COOP/COEP headers, test config)
package.json

src/
├── main.js              # App bootstrap: initDatabase() → createApp() → mount
├── styles/
│   ├── tokens.css       # Design tokens (colors, spacing, typography, radius, shadow)
│   ├── base.css         # CSS reset and base element styles
│   └── components.css   # BEM component styles
├── db/
│   ├── database.js      # SQLite WASM init, query(), execute(), transaction()
│   ├── migrations.js    # Schema DDL and PRAGMA user_version management
│   └── seed.js          # seedIfEmpty(): sample users, projects, tasks
├── stores/
│   ├── users.js         # getCurrentUser, setCurrentUser, getAllUsers, getUser
│   ├── projects.js      # getProjectsForUser, createProject, addMember, removeMember
│   ├── tasks.js         # getTasksByColumn, createTask, moveTask, updateTask
│   └── comments.js      # getComments, addComment, editComment, deleteComment, canModifyComment
├── components/
│   ├── app.js           # Root component; router integration; view mounting
│   ├── profile-selector.js
│   ├── project-list.js
│   ├── project-form.js
│   ├── member-manager.js
│   ├── kanban-board.js
│   ├── kanban-column.js
│   ├── task-card.js
│   ├── task-form.js
│   ├── task-detail.js
│   └── comment-list.js
├── utils/
│   ├── router.js        # Hash-based router (navigate, onRoute, start)
│   ├── dnd.js           # makeDraggable, makeDropTarget
│   ├── id.js            # generateId() → crypto.randomUUID()
│   ├── time.js          # nowUnix(), formatTimestamp()
│   └── dom.js           # createElement, clearElement, showElement, hideElement
└── data/
    └── seed-data.js     # Static seed definitions (users + 3 projects + tasks)

tests/
├── unit/
│   ├── stores/
│   │   ├── users.test.js
│   │   ├── projects.test.js
│   │   ├── tasks.test.js
│   │   └── comments.test.js
│   └── utils/
│       ├── router.test.js
│       └── time.test.js
├── integration/
│   └── db/
│       ├── database.test.js   # initDatabase, query, execute, transaction
│       ├── migrations.test.js # Schema creation, user_version pragma
│       └── seed.test.js       # seedIfEmpty idempotency
└── e2e/
    ├── us1-profile-selection.spec.js
    ├── us2-board-view.spec.js
    ├── us3-drag-and-drop.spec.js
    ├── us4-projects-members.spec.js
    ├── us5-create-tasks.spec.js
    └── us6-comments.spec.js
```

**Structure Decision**: Single-project web app (no backend/frontend split). All code lives at
the repository root under `src/`. Tests are co-located under `tests/` mirroring the source
structure. No monorepo setup needed.

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| `@sqlite.org/sqlite-wasm` library dependency | User explicitly specified SQLite as the storage engine; OPFS provides true persistence beyond localStorage limits | localStorage: 5-10 MB cap insufficient for growing task/comment data; IndexedDB: no SQL semantics, higher query complexity |
| COOP/COEP header requirement | SharedArrayBuffer required by `@sqlite.org/sqlite-wasm` for OPFS VFS; these headers trigger cross-origin isolation | Cannot be avoided when using the official SQLite WASM package with OPFS; header configuration is a one-time Vite setup |
| Project visibility assumed (Q1 unresolved) | `project_members` used as access-control boundary without formal user confirmation; assumed members-only per constitution Principle III | Leaving undefined blocks schema design; global visibility requires no join but violates Principle III |

---

## Phase 0: Research — Completed

All technology decisions resolved. See [research.md](research.md) for full rationale.

**Resolved decisions**:
1. SQLite in browser: `@sqlite.org/sqlite-wasm` + OPFS
2. Drag and drop: native HTML5 DnD API
3. Testing: Vitest (unit/integration) + Playwright (E2E)
4. CSS: vanilla CSS custom properties + BEM
5. Routing: custom hash-based router (`hashchange`)
6. Project visibility: members-only (assumed, pending Q1 confirmation)
7. Task ordering within columns: insertion order (`sort_order`, no intra-column reorder in v1)
8. ID strategy: `crypto.randomUUID()`
9. Module pattern: ES modules, factory functions returning `HTMLElement`

---

## Phase 1: Design — Completed

All design artifacts generated.

### Data Model
See [data-model.md](data-model.md).

**Key schema decisions**:
- `column_key` TEXT field on `tasks` (CHECK constraint to 4 valid values)
- `sort_order` INTEGER for future intra-column reordering (insertion order in v1)
- `project_members` join table enforces membership-based access control
- Comments: `author_id` immutable; ownership checked at application layer
- PRAGMA `user_version` for migration versioning

### Contracts
See [contracts/](contracts/):
- `database.md` — DB layer: `initDatabase`, `query`, `execute`, `transaction`
- `stores.md` — 4 store modules: users, projects, tasks, comments
- `components.md` — 11 component factory functions
- `utilities.md` — router, dnd, id, time, dom utilities

### Validation Guide
See [quickstart.md](quickstart.md).

**6 manual validation scenarios** map 1:1 to user stories. Includes seed data verification
table and OPFS reset instructions for development.

### Post-Design Constitution Check

| Principle | Post-Design Status | Notes |
|-----------|-------------------|-------|
| I. API-First Design | ✅ CONFIRMED | All 4 contract files complete before any implementation task |
| II. Testing Standards | ✅ CONFIRMED | Test file structure defined; E2E spec files map to user stories |
| III. Team-Centric Data Model | ✅ CONFIRMED | `project_members` enforces access; all tasks cascade-scoped to projects |
| IV. Code Quality | ✅ CONFIRMED | Module boundaries clean; single responsibility per file |
| V. Performance & Observability | ✅ CONFIRMED | WASM cold-start mitigated by loading screen; structured logs in DB module |
| VI. User Experience Consistency | ✅ CONFIRMED | `tokens.css` established first; all states (loading, empty, error) in component contracts |
