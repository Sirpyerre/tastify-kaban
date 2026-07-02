import { query, execute } from './database.js'

export function runMigrations() {
  const [{ user_version: version }] = query('PRAGMA user_version')

  if (version === 0) {
    applyMigration1()
  }
}

function applyMigration1() {
  execute(`
    CREATE TABLE IF NOT EXISTS users (
      id       TEXT PRIMARY KEY,
      name     TEXT NOT NULL,
      role     TEXT NOT NULL CHECK (role IN ('product_manager', 'engineer')),
      initials TEXT NOT NULL
    )
  `)

  execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL CHECK (length(trim(name)) > 0),
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `)

  execute(`
    CREATE TABLE IF NOT EXISTS project_members (
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      user_id    TEXT NOT NULL REFERENCES users(id),
      PRIMARY KEY (project_id, user_id)
    )
  `)

  execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          TEXT    PRIMARY KEY,
      project_id  TEXT    NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title       TEXT    NOT NULL CHECK (length(trim(title)) > 0),
      description TEXT,
      assignee_id TEXT    REFERENCES users(id) ON DELETE SET NULL,
      column_key  TEXT    NOT NULL DEFAULT 'todo'
                  CHECK (column_key IN ('todo', 'in_progress', 'in_review', 'done')),
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `)

  execute(`
    CREATE INDEX IF NOT EXISTS idx_tasks_project_column
      ON tasks(project_id, column_key, sort_order)
  `)

  execute(`
    CREATE TABLE IF NOT EXISTS comments (
      id         TEXT    PRIMARY KEY,
      task_id    TEXT    NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      author_id  TEXT    NOT NULL REFERENCES users(id),
      body       TEXT    NOT NULL CHECK (length(trim(body)) > 0),
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `)

  execute(`
    CREATE INDEX IF NOT EXISTS idx_comments_task
      ON comments(task_id, created_at)
  `)

  execute(`
    CREATE INDEX IF NOT EXISTS idx_project_members_user
      ON project_members(user_id)
  `)

  execute('PRAGMA user_version = 1')
}
