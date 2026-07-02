# Contract: Database Module (`src/db/`)

**Feature**: 001-kanban-board
**Date**: 2026-06-26

The database module owns all SQLite WASM initialization, schema creation, and raw query
execution. No other module interacts with the SQLite instance directly — all data access goes
through the store modules.

---

## `src/db/database.js`

### Exports

#### `initDatabase(): Promise<void>`

Initializes the SQLite WASM runtime, opens (or creates) the OPFS database file, runs any
pending migrations, and seeds sample data if the database is new.

- MUST be called once at application startup before any store operation.
- MUST emit a structured log entry on success and on error.
- Throws if OPFS is unavailable or if WASM fails to load.
- Resolves only after the schema is verified and the connection is ready.

#### `query(sql: string, params?: any[]): Row[]`

Executes a read-only SQL statement and returns all result rows as plain objects.

- `sql`: Parameterized SQL string (use `?` placeholders).
- `params`: Array of values bound to `?` placeholders in order.
- Returns an empty array if no rows match.
- Throws on SQL syntax errors or constraint violations.
- MUST NOT be used for INSERT / UPDATE / DELETE — use `execute()`.

#### `execute(sql: string, params?: any[]): void`

Executes a write SQL statement (INSERT, UPDATE, DELETE, DDL).

- Throws on SQL errors or constraint violations.
- Does not return rows.

#### `transaction(operations: () => void): void`

Wraps multiple `execute()` calls in a single SQLite transaction.

- If `operations` throws, the transaction is rolled back.
- If `operations` completes without throwing, the transaction is committed.
- Nested transactions are not supported.

---

## `src/db/migrations.js`

### Exports

#### `runMigrations(): void`

Checks `PRAGMA user_version` and applies all unapplied migrations in order.

- Migration 1: Creates all tables and indexes (see data-model.md for DDL).
- Sets `PRAGMA user_version` to the highest applied migration number.
- MUST be called inside `initDatabase()`, never directly by application code.

---

## `src/db/seed.js`

### Exports

#### `seedIfEmpty(): void`

Inserts the 5 predefined users and 3 sample projects (with tasks and members) if the `users`
table is empty.

- Idempotent: does nothing if users already exist.
- Wraps all inserts in a single transaction.
- Sample data is defined in `src/data/seed-data.js` (static, not computed).
- MUST be called after `runMigrations()`, inside `initDatabase()`.

---

## Constraints

- No module outside `src/db/` may import the SQLite instance directly.
- All store modules MUST use `query()` and `execute()` from `database.js`.
- SQL strings MUST use parameterized queries (`?` placeholders) — no string interpolation of
  user-provided values.
