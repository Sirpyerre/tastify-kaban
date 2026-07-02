import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('tasks store', () => {
  let tasks, db

  beforeEach(async () => {
    vi.resetModules()
    const dbModule = await import('../../../src/db/database.js')
    await dbModule.initDatabase({ vfsOverride: ':memory:' })
    db = dbModule
    tasks = await import('../../../src/stores/tasks.js')
  })

  it('getTasksByColumn returns BoardData with 4 keys', () => {
    const board = tasks.getTasksByColumn('proj-1')
    expect(Object.keys(board).sort()).toEqual(['done', 'in_progress', 'in_review', 'todo'])
  })

  it('getTasksByColumn includes assignee_name on tasks', () => {
    const board = tasks.getTasksByColumn('proj-1')
    const todo = board.todo
    expect(todo.length).toBeGreaterThan(0)
    expect('assignee_name' in todo[0]).toBe(true)
  })

  it('createTask adds task to todo column', () => {
    const task = tasks.createTask('proj-1', 'New task')
    expect(task.column_key).toBe('todo')
    expect(task.project_id).toBe('proj-1')
    expect(task.title).toBe('New task')
  })

  it('createTask assigns sort_order greater than existing tasks in todo', () => {
    const board = tasks.getTasksByColumn('proj-1')
    const maxOrder = Math.max(...board.todo.map(t => t.sort_order), 0)
    const task = tasks.createTask('proj-1', 'Last task')
    expect(task.sort_order).toBe(maxOrder + 1)
  })

  it('createTask throws for empty title', () => {
    expect(() => tasks.createTask('proj-1', '   ')).toThrow()
  })

  it('createTask with assigneeId sets the assignee', () => {
    const task = tasks.createTask('proj-1', 'Assigned', { assigneeId: 'user-pm-1' })
    expect(task.assignee_id).toBe('user-pm-1')
  })

  it('moveTask changes column_key', () => {
    const board = tasks.getTasksByColumn('proj-1')
    const todoTask = board.todo[0]
    tasks.moveTask(todoTask.id, 'done')
    const updated = tasks.getTask(todoTask.id)
    expect(updated.column_key).toBe('done')
  })

  it('moveTask is a no-op when targetColumn equals current column', () => {
    const board = tasks.getTasksByColumn('proj-1')
    const doneTask = board.done[0]
    const originalOrder = doneTask.sort_order
    tasks.moveTask(doneTask.id, 'done')
    const unchanged = tasks.getTask(doneTask.id)
    expect(unchanged.sort_order).toBe(originalOrder)
  })

  it('moveTask throws for unknown taskId', () => {
    expect(() => tasks.moveTask('nonexistent', 'todo')).toThrow()
  })

  it('getTask returns null for unknown id', () => {
    expect(tasks.getTask('nonexistent')).toBeNull()
  })

  it('updateTask updates title', () => {
    const board = tasks.getTasksByColumn('proj-1')
    const task = board.todo[0]
    const updated = tasks.updateTask(task.id, { title: 'Updated title' })
    expect(updated.title).toBe('Updated title')
  })

  it('updateTask throws for empty title', () => {
    const board = tasks.getTasksByColumn('proj-1')
    const task = board.todo[0]
    expect(() => tasks.updateTask(task.id, { title: '   ' })).toThrow()
  })
})
