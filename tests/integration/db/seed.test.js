import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('seed', () => {
  let db

  beforeEach(async () => {
    vi.resetModules()
    db = await import('../../../src/db/database.js')
    await db.initDatabase({ vfsOverride: ':memory:' })
  })

  it('seeds exactly 5 predefined users', () => {
    const rows = db.query('SELECT COUNT(*) as n FROM users')
    expect(rows[0].n).toBe(5)
  })

  it('seeds user-pm-1 as Alex Chen (product_manager)', () => {
    const rows = db.query('SELECT * FROM users WHERE id = ?', ['user-pm-1'])
    expect(rows).toHaveLength(1)
    expect(rows[0].name).toBe('Alex Chen')
    expect(rows[0].role).toBe('product_manager')
    expect(rows[0].initials).toBe('AC')
  })

  it('seeds exactly 3 sample projects', () => {
    const rows = db.query('SELECT COUNT(*) as n FROM projects')
    expect(rows[0].n).toBe(3)
  })

  it('seeds Mobile App Redesign project', () => {
    const rows = db.query("SELECT * FROM projects WHERE name = 'Mobile App Redesign'")
    expect(rows).toHaveLength(1)
  })

  it('each project has at least 1 task in each of the 4 columns', () => {
    const projects = db.query('SELECT id FROM projects')
    for (const { id: projectId } of projects) {
      for (const col of ['todo', 'in_progress', 'in_review', 'done']) {
        const tasks = db.query(
          'SELECT COUNT(*) as n FROM tasks WHERE project_id = ? AND column_key = ?',
          [projectId, col]
        )
        expect(tasks[0].n, `project ${projectId} should have tasks in ${col}`).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('total tasks are between 5 and 15 per project', () => {
    const projects = db.query('SELECT id FROM projects')
    for (const { id: projectId } of projects) {
      const tasks = db.query(
        'SELECT COUNT(*) as n FROM tasks WHERE project_id = ?',
        [projectId]
      )
      expect(tasks[0].n).toBeGreaterThanOrEqual(5)
      expect(tasks[0].n).toBeLessThanOrEqual(15)
    }
  })

  it('all 5 users are members of all 3 projects', () => {
    const rows = db.query('SELECT COUNT(*) as n FROM project_members')
    expect(rows[0].n).toBe(15)
  })

  it('seedIfEmpty is idempotent', async () => {
    vi.resetModules()
    const db2 = await import('../../../src/db/database.js')
    await db2.initDatabase({ vfsOverride: ':memory:' })
    const { seedIfEmpty } = await import('../../../src/db/seed.js')
    seedIfEmpty()
    const rows = db2.query('SELECT COUNT(*) as n FROM users')
    expect(rows[0].n).toBe(5)
  })
})
