import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('projects store', () => {
  let projects

  beforeEach(async () => {
    vi.resetModules()
    const db = await import('../../../src/db/database.js')
    await db.initDatabase({ vfsOverride: ':memory:' })
    projects = await import('../../../src/stores/projects.js')
  })

  it('getProjectsForUser returns seeded projects for all users', () => {
    const result = projects.getProjectsForUser('user-pm-1')
    expect(result.length).toBe(3)
  })

  it('getProjectsForUser returns projects ordered by created_at descending', () => {
    const result = projects.getProjectsForUser('user-pm-1')
    expect(result[0].created_at).toBeGreaterThanOrEqual(result[1].created_at)
  })

  it('getProjectsForUser returns empty array for user with no projects', async () => {
    const db2 = await import('../../../src/db/database.js')
    db2.execute('INSERT INTO users VALUES (?,?,?,?)', ['lone-user', 'Lone', 'engineer', 'LO'])
    const result = projects.getProjectsForUser('lone-user')
    expect(result).toEqual([])
  })

  it('getProject returns project by id', () => {
    const p = projects.getProject('proj-1')
    expect(p.name).toBe('Mobile App Redesign')
  })

  it('getProject returns null for unknown id', () => {
    expect(projects.getProject('unknown')).toBeNull()
  })

  it('createProject creates a new project', () => {
    const p = projects.createProject('New Project')
    expect(p.name).toBe('New Project')
    expect(typeof p.id).toBe('string')
    expect(p.id.length).toBeGreaterThan(0)
  })

  it('createProject trims whitespace from name', () => {
    const p = projects.createProject('  Trimmed  ')
    expect(p.name).toBe('Trimmed')
  })

  it('createProject throws for empty name', () => {
    expect(() => projects.createProject('   ')).toThrow()
  })

  it('getMembers returns all members of a project', () => {
    const members = projects.getMembers('proj-1')
    expect(members).toHaveLength(5)
  })

  it('getMembers returns product_manager first', () => {
    const members = projects.getMembers('proj-1')
    expect(members[0].role).toBe('product_manager')
  })

  it('addMember adds a user to a project', () => {
    const p = projects.createProject('Solo Project')
    const before = projects.getMembers(p.id)
    projects.addMember(p.id, 'user-pm-1')
    const after = projects.getMembers(p.id)
    expect(after.length).toBe(before.length + 1)
  })

  it('addMember is idempotent (INSERT OR IGNORE)', () => {
    projects.addMember('proj-1', 'user-pm-1')
    const members = projects.getMembers('proj-1')
    expect(members.filter(m => m.id === 'user-pm-1')).toHaveLength(1)
  })

  it('removeMember removes a user from a project', () => {
    const before = projects.getMembers('proj-1').length
    projects.removeMember('proj-1', 'user-pm-1')
    const after = projects.getMembers('proj-1').length
    expect(after).toBe(before - 1)
  })

  it('removeMember is a no-op for non-member', () => {
    const p = projects.createProject('Empty')
    expect(() => projects.removeMember(p.id, 'user-pm-1')).not.toThrow()
  })

  it('isMember returns true for a member', () => {
    expect(projects.isMember('proj-1', 'user-pm-1')).toBe(true)
  })

  it('isMember returns false for a non-member', () => {
    const p = projects.createProject('Empty2')
    expect(projects.isMember(p.id, 'user-pm-1')).toBe(false)
  })
})
