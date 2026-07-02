import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('migrations', () => {
  let db

  beforeEach(async () => {
    vi.resetModules()
    db = await import('../../../src/db/database.js')
    await db.initDatabase({ vfsOverride: ':memory:' })
  })

  it('creates users table', () => {
    const tables = db.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    )
    expect(tables).toHaveLength(1)
  })

  it('creates projects table', () => {
    const tables = db.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='projects'"
    )
    expect(tables).toHaveLength(1)
  })

  it('creates project_members table', () => {
    const tables = db.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='project_members'"
    )
    expect(tables).toHaveLength(1)
  })

  it('creates tasks table', () => {
    const tables = db.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'"
    )
    expect(tables).toHaveLength(1)
  })

  it('creates comments table', () => {
    const tables = db.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='comments'"
    )
    expect(tables).toHaveLength(1)
  })

  it('creates index on tasks(project_id, column_key, sort_order)', () => {
    const indexes = db.query(
      "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_tasks_project_column'"
    )
    expect(indexes).toHaveLength(1)
  })

  it('creates index on comments(task_id, created_at)', () => {
    const indexes = db.query(
      "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_comments_task'"
    )
    expect(indexes).toHaveLength(1)
  })

  it('enforces valid column_key values on tasks', () => {
    db.execute('INSERT INTO users VALUES (?, ?, ?, ?)', ['u1', 'Test', 'engineer', 'TT'])
    db.execute('INSERT INTO projects VALUES (?, ?, ?)', ['p1', 'Proj', 1000000])
    expect(() => {
      db.execute(
        'INSERT INTO tasks(id, project_id, title, column_key, sort_order, created_at) VALUES (?,?,?,?,?,?)',
        ['t1', 'p1', 'Task', 'invalid_column', 0, 1000000]
      )
    }).toThrow()
  })

  it('enforces foreign key cascade delete from project to tasks', () => {
    db.execute('INSERT INTO users VALUES (?, ?, ?, ?)', ['u1', 'Test', 'engineer', 'TT'])
    db.execute('INSERT INTO projects VALUES (?, ?, ?)', ['p1', 'Proj', 1000000])
    db.execute(
      'INSERT INTO tasks(id, project_id, title, column_key, sort_order, created_at) VALUES (?,?,?,?,?,?)',
      ['t1', 'p1', 'Task', 'todo', 0, 1000000]
    )
    db.execute('DELETE FROM projects WHERE id = ?', ['p1'])
    const tasks = db.query('SELECT * FROM tasks WHERE id = ?', ['t1'])
    expect(tasks).toHaveLength(0)
  })

  it('user_version pragma is set to 1', () => {
    const rows = db.query('PRAGMA user_version')
    expect(rows[0]['user_version']).toBe(1)
  })
})
