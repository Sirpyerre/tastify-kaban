import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('comments store', () => {
  let comments, tasks

  beforeEach(async () => {
    vi.resetModules()
    const db = await import('../../../src/db/database.js')
    await db.initDatabase({ vfsOverride: ':memory:' })
    comments = await import('../../../src/stores/comments.js')
    tasks = await import('../../../src/stores/tasks.js')
  })

  function getFirstTask() {
    const board = tasks.getTasksByColumn('proj-1')
    return board.todo[0]
  }

  it('getComments returns empty array for task with no comments', () => {
    const task = getFirstTask()
    const result = comments.getComments(task.id)
    expect(result).toEqual([])
  })

  it('addComment creates a comment and returns it', () => {
    const task = getFirstTask()
    const comment = comments.addComment(task.id, 'user-pm-1', 'Hello world')
    expect(comment.body).toBe('Hello world')
    expect(comment.author_id).toBe('user-pm-1')
    expect(comment.task_id).toBe(task.id)
  })

  it('addComment trims the body', () => {
    const task = getFirstTask()
    const comment = comments.addComment(task.id, 'user-pm-1', '  Trimmed  ')
    expect(comment.body).toBe('Trimmed')
  })

  it('addComment throws for empty body', () => {
    const task = getFirstTask()
    expect(() => comments.addComment(task.id, 'user-pm-1', '   ')).toThrow()
  })

  it('getComments returns comments in chronological order', () => {
    const task = getFirstTask()
    comments.addComment(task.id, 'user-pm-1', 'First')
    comments.addComment(task.id, 'user-eng-1', 'Second')
    const result = comments.getComments(task.id)
    expect(result[0].body).toBe('First')
    expect(result[1].body).toBe('Second')
  })

  it('canModifyComment returns true when userId matches author_id', () => {
    const fakeComment = { author_id: 'user-pm-1', body: 'x', id: '1', task_id: 't1', created_at: 0, updated_at: 0 }
    expect(comments.canModifyComment(fakeComment, 'user-pm-1')).toBe(true)
  })

  it('canModifyComment returns false when userId does not match author_id', () => {
    const fakeComment = { author_id: 'user-pm-1', body: 'x', id: '1', task_id: 't1', created_at: 0, updated_at: 0 }
    expect(comments.canModifyComment(fakeComment, 'user-eng-1')).toBe(false)
  })

  it('editComment updates body when called by author', () => {
    const task = getFirstTask()
    const c = comments.addComment(task.id, 'user-pm-1', 'Original')
    const updated = comments.editComment(c.id, 'user-pm-1', 'Edited')
    expect(updated.body).toBe('Edited')
  })

  it('editComment throws when called by non-author', () => {
    const task = getFirstTask()
    const c = comments.addComment(task.id, 'user-pm-1', 'Mine')
    expect(() => comments.editComment(c.id, 'user-eng-1', 'Stolen')).toThrow()
  })

  it('editComment throws for empty newBody', () => {
    const task = getFirstTask()
    const c = comments.addComment(task.id, 'user-pm-1', 'Mine')
    expect(() => comments.editComment(c.id, 'user-pm-1', '  ')).toThrow()
  })

  it('deleteComment removes the comment when called by author', () => {
    const task = getFirstTask()
    const c = comments.addComment(task.id, 'user-pm-1', 'To delete')
    comments.deleteComment(c.id, 'user-pm-1')
    const remaining = comments.getComments(task.id)
    expect(remaining.find(r => r.id === c.id)).toBeUndefined()
  })

  it('deleteComment throws when called by non-author', () => {
    const task = getFirstTask()
    const c = comments.addComment(task.id, 'user-pm-1', 'Mine')
    expect(() => comments.deleteComment(c.id, 'user-eng-1')).toThrow()
  })
})
