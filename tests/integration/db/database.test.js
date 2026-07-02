import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('database module', () => {
  let db

  beforeEach(async () => {
    vi.resetModules()
    db = await import('../../../src/db/database.js')
    await db.initDatabase({ vfsOverride: ':memory:' })
  })

  it('query returns empty array when no rows match', () => {
    const rows = db.query('SELECT * FROM users WHERE id = ?', ['nonexistent'])
    expect(rows).toEqual([])
  })

  it('query returns rows as plain objects', () => {
    db.execute('INSERT INTO users VALUES (?, ?, ?, ?)', ['u1', 'Test User', 'engineer', 'TU'])
    const rows = db.query('SELECT * FROM users WHERE id = ?', ['u1'])
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ id: 'u1', name: 'Test User', role: 'engineer', initials: 'TU' })
  })

  it('execute runs INSERT statements', () => {
    db.execute('INSERT INTO users VALUES (?, ?, ?, ?)', ['u2', 'Jane', 'product_manager', 'JN'])
    const rows = db.query('SELECT * FROM users WHERE id = ?', ['u2'])
    expect(rows).toHaveLength(1)
  })

  it('execute throws on constraint violation', () => {
    db.execute('INSERT INTO users VALUES (?, ?, ?, ?)', ['u3', 'Test', 'engineer', 'TT'])
    expect(() => {
      db.execute('INSERT INTO users VALUES (?, ?, ?, ?)', ['u3', 'Dupe', 'engineer', 'DU'])
    }).toThrow()
  })

  it('transaction commits on success', () => {
    db.transaction(() => {
      db.execute('INSERT INTO users VALUES (?, ?, ?, ?)', ['u4', 'Alice', 'engineer', 'AL'])
      db.execute('INSERT INTO users VALUES (?, ?, ?, ?)', ['u5', 'Bob', 'engineer', 'BB'])
    })
    expect(db.query('SELECT COUNT(*) as n FROM users WHERE id IN (?,?)', ['u4', 'u5'])[0].n).toBe(2)
  })

  it('transaction rolls back on error', () => {
    expect(() => {
      db.transaction(() => {
        db.execute('INSERT INTO users VALUES (?, ?, ?, ?)', ['u6', 'Carol', 'engineer', 'CC'])
        throw new Error('abort')
      })
    }).toThrow('abort')
    expect(db.query('SELECT * FROM users WHERE id = ?', ['u6'])).toEqual([])
  })
})
