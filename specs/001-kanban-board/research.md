# Research: Taskify Kanban Board Platform

**Feature**: 001-kanban-board
**Date**: 2026-06-26
**Plan**: [plan.md](plan.md)

---

## Decision 1: SQLite in the Browser

**Decision**: `@sqlite.org/sqlite-wasm` with the OPFS (Origin Private File System) VFS for
persistence.

**Rationale**: The user specified a local SQLite database. The official SQLite WASM package is
maintained by the SQLite core team, ships the most current SQLite version, and provides first-class
OPFS support for durable, cross-session persistence. OPFS stores the database file in a
browser-private filesystem that survives page reloads and browser restarts — satisfying the spec's
requirement that data persists across sessions.

**Configuration required**: OPFS and SharedArrayBuffer require Cross-Origin Isolation headers.
Vite's dev server must be configured to emit `Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Embedder-Policy: require-corp`. A production deployment must also set these headers
at the server level.

**Alternatives considered**:
- `sql.js`: Older WASM port, no native OPFS support, requires manual serialization to localStorage
  (5-10 MB limit). Rejected: size limit too low for growing task/comment data.
- `wa-sqlite`: Community fork, good OPFS support, but unofficial. Rejected: official package
  preferred for long-term maintenance.
- `IndexedDB` directly: Browser-native, no SQLite semantics. Rejected: user explicitly specified
  SQLite.
- localStorage only: 5-10 MB cap, no relational queries. Rejected: insufficient for the data model.

---

## Decision 2: Drag and Drop

**Decision**: Native HTML5 Drag and Drop API (`draggable`, `dragstart`, `dragover`, `drop`).

**Rationale**: The native DnD API is supported in all target browsers (Chrome, Firefox, Safari,
Edge). For the Kanban use case — moving task cards between columns — the native API is sufficient
and requires zero additional libraries. This directly satisfies the "vanilla JS as much as
possible" constraint.

**Limitations and mitigations**:
- Touch devices: native DnD does not fire on mobile. Acceptable per spec assumption (desktop-
  targeted). Can be added in a later version using Pointer Events.
- Drag image: default ghost image is the element itself. Custom ghost can be set via
  `dataTransfer.setDragImage()` if visual refinement is needed.

**Alternatives considered**:
- `@dnd-kit/core`: Excellent accessibility and touch support. Rejected: library dependency
  contradicts "minimal libraries / vanilla JS" constraint.
- `SortableJS`: Lightweight, but still an external dependency. Rejected: same reason.
- `interact.js`: Full pointer-event support. Rejected: same reason.

---

## Decision 3: Testing Stack

**Decision**: Vitest for unit and integration tests; Playwright for end-to-end tests.

**Rationale**: Vitest is the native test runner for Vite projects — it reuses the same config,
transformation pipeline, and module resolution. No configuration overhead. Playwright provides
reliable cross-browser E2E testing, works against the Vite dev server, and can simulate drag-and-
drop interactions programmatically. Both are well-maintained and widely used.

**Alternatives considered**:
- Jest: Requires separate Babel/ESM transform config when used with Vite. Rejected: extra setup
  burden.
- Cypress: Heavier install (~200 MB), slower CI cycles. Rejected: Playwright is lighter and
  faster for this project size.
- Manual testing only: Explicitly prohibited by constitution Principle II (Testing Standards).
  Rejected.

---

## Decision 4: CSS Architecture

**Decision**: Vanilla CSS with CSS custom properties (design tokens) and BEM class naming.

**Rationale**: CSS custom properties (`--color-primary`, `--spacing-md`, etc.) fulfill the
constitution's Principle VI requirement for a "defined design token set" without any tooling
dependency. BEM ensures class names are unambiguous (matching Principle IV's naming rule). No
CSS preprocessor or utility framework is needed.

**Token categories**:
- Colors: `--color-brand-*`, `--color-status-*`, `--color-user-highlight`, `--color-neutral-*`
- Spacing: `--spacing-xs` through `--spacing-xl` (4px base unit scale)
- Typography: `--font-size-*`, `--font-weight-*`, `--line-height-*`
- Radius: `--radius-sm`, `--radius-md`, `--radius-lg`
- Shadow: `--shadow-card`, `--shadow-modal`

**Alternatives considered**:
- Tailwind CSS: Utility-first but a build-time dependency. Rejected: contradicts "minimal
  libraries" constraint.
- CSS Modules: Requires bundler support. Acceptable with Vite, but BEM is simpler and needs no
  config. Rejected: unnecessary complexity.
- Sass/Less: Preprocessor overhead. Rejected: CSS custom properties fully replace variables.

---

## Decision 5: Client-Side Routing

**Decision**: Custom hash-based router using the `hashchange` event (no library).

**Rationale**: Hash routing requires zero server configuration — the server always serves
`index.html` and the browser resolves routes via the URL fragment. Implementation is ~30 lines of
vanilla JS. Routes: `#/` (profile selection), `#/projects` (project list), `#/projects/:id`
(board).

**Alternatives considered**:
- History API router: Cleaner URLs but requires server-side catch-all configuration in both dev
  and production. Rejected: adds server dependency.
- Single-state no-routing: Show/hide DOM sections. Rejected: breaks browser back/forward buttons
  and makes deep-linking impossible.
- `page.js` or `navigo`: Small libraries but still external dependencies. Rejected: custom
  implementation is simpler here.

---

## Decision 6: Project Visibility (Q1 — Pending Formal Clarification)

**Decision**: Members-only visibility (assumed pending resolution of clarification Q1).

**Rationale**: Per constitution Principle III (Team-Centric Data Model), no user should access
data outside their team context. Applying this to projects: users see only projects they have
been added to as members. This makes `project_members` the authorization boundary. The
`getProjectsForUser(userId)` query filters by membership.

**Note**: This decision is assumed, not confirmed. If the user later clarifies Q1 as Option A
(global visibility), the `projects` store query must be updated and the `project_members` table
role changes to assignment-only rather than access-control.

---

## Decision 7: Task Ordering Within Columns

**Decision**: Insertion order (creation timestamp). No manual intra-column reordering in v1.

**Rationale**: The spec and clarification session did not specify reordering within columns.
Insertion order (newest at bottom) is the simplest behavior and matches most Kanban tools'
default. The `sort_order` field is included in the schema to make future manual reordering a
non-breaking addition.

**Drag and drop scope**: Drag-and-drop moves cards between columns only. Dropping onto the same
column is a no-op.

---

## Decision 8: ID Strategy

**Decision**: `crypto.randomUUID()` for all entity IDs (TEXT primary keys in SQLite).

**Rationale**: Browser-native, cryptographically random, no library needed. UUIDs are globally
unique and safe to generate client-side without coordination. TEXT primary keys in SQLite have
negligible performance impact at this data scale (5 users, ~50 sample tasks).

---

## Decision 9: Module Pattern

**Decision**: ES Modules (`.js` files with `export`/`import`). No bundling of styles (CSS loaded
via `<link>` tags or `@import`).

**Rationale**: Vite natively handles ES modules. No CommonJS. Each component is a JavaScript
module that exports a factory function returning an `HTMLElement`. Components manage their own
DOM. State is managed by store modules (plain JS objects with SQLite-backed persistence), not a
reactive framework.

**Component model**:
```
componentFactory(props) → HTMLElement
```
Components re-render by replacing their root element or by targeted DOM mutation. No virtual DOM.
No reactivity framework.
