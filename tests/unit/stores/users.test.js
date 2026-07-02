import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('users store', () => {
  let users

  beforeEach(async () => {
    vi.resetModules()
    const db = await import('../../../src/db/database.js')
    await db.initDatabase({ vfsOverride: ':memory:' })
    users = await import('../../../src/stores/users.js')
  })

  it('getAllUsers returns all 5 seeded users', () => {
    const all = users.getAllUsers()
    expect(all).toHaveLength(5)
  })

  it('getAllUsers returns product_manager first', () => {
    const all = users.getAllUsers()
    expect(all[0].role).toBe('product_manager')
  })

  it('getUser returns correct user by id', () => {
    const user = users.getUser('user-pm-1')
    expect(user.name).toBe('Alex Chen')
    expect(user.initials).toBe('AC')
  })

  it('getUser returns null for unknown id', () => {
    expect(users.getUser('nonexistent')).toBeNull()
  })

  it('getCurrentUser returns null before selection', () => {
    expect(users.getCurrentUser()).toBeNull()
  })

  it('setCurrentUser + getCurrentUser returns the correct user', () => {
    users.setCurrentUser('user-eng-1')
    const current = users.getCurrentUser()
    expect(current.id).toBe('user-eng-1')
    expect(current.name).toBe('Jordan Rivera')
  })

  it('setCurrentUser throws for unknown id', () => {
    expect(() => users.setCurrentUser('unknown')).toThrow()
  })

  it('clearCurrentUser resets session state to null', () => {
    users.setCurrentUser('user-eng-2')
    users.clearCurrentUser()
    expect(users.getCurrentUser()).toBeNull()
  })
})
