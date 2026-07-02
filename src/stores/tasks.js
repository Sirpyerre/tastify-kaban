import { query, execute } from '../db/database.js'
import { generateId } from '../utils/id.js'
import { nowUnix } from '../utils/time.js'
import { EventBus, BOARD_UPDATED } from '../utils/event-bus.js'

export function getTasksByColumn(projectId) {
  const rows = query(
    `SELECT t.*, u.name as assignee_name
     FROM tasks t
     LEFT JOIN users u ON u.id = t.assignee_id
     WHERE t.project_id = ?
     ORDER BY t.sort_order ASC`,
    [projectId]
  )

  const board = { todo: [], in_progress: [], in_review: [], done: [] }
  for (const task of rows) {
    board[task.column_key].push(task)
  }
  return board
}

export function getTask(id) {
  const rows = query(
    `SELECT t.*, u.name as assignee_name
     FROM tasks t
     LEFT JOIN users u ON u.id = t.assignee_id
     WHERE t.id = ?`,
    [id]
  )
  return rows[0] ?? null
}

export function createTask(projectId, title, { description = null, assigneeId = null } = {}) {
  const trimmed = title.trim()
  if (!trimmed) throw new Error('Task title cannot be empty')

  const [{ maxOrder }] = query(
    `SELECT COALESCE(MAX(sort_order), 0) as maxOrder
     FROM tasks WHERE project_id = ? AND column_key = 'todo'`,
    [projectId]
  )

  const id = generateId()
  const created_at = nowUnix()
  execute(
    `INSERT INTO tasks(id, project_id, title, description, assignee_id, column_key, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, 'todo', ?, ?)`,
    [id, projectId, trimmed, description, assigneeId, maxOrder + 1, created_at]
  )

  EventBus.emit(BOARD_UPDATED, { projectId })
  return getTask(id)
}

export function moveTask(taskId, targetColumn) {
  const task = getTask(taskId)
  if (!task) throw new Error(`Task not found: ${taskId}`)
  if (task.column_key === targetColumn) return

  const [{ maxOrder }] = query(
    `SELECT COALESCE(MAX(sort_order), 0) as maxOrder
     FROM tasks WHERE project_id = ? AND column_key = ?`,
    [task.project_id, targetColumn]
  )

  execute(
    'UPDATE tasks SET column_key = ?, sort_order = ? WHERE id = ?',
    [targetColumn, maxOrder + 1, taskId]
  )

  EventBus.emit(BOARD_UPDATED, { projectId: task.project_id })
}

export function updateTask(taskId, updates) {
  const task = getTask(taskId)
  if (!task) throw new Error(`Task not found: ${taskId}`)

  const sets = []
  const params = []

  if (updates.title !== undefined) {
    const trimmed = updates.title.trim()
    if (!trimmed) throw new Error('Task title cannot be empty')
    sets.push('title = ?')
    params.push(trimmed)
  }
  if (updates.description !== undefined) {
    sets.push('description = ?')
    params.push(updates.description)
  }
  if ('assigneeId' in updates) {
    sets.push('assignee_id = ?')
    params.push(updates.assigneeId)
  }

  if (sets.length) {
    params.push(taskId)
    execute(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`, params)
    EventBus.emit(BOARD_UPDATED, { projectId: task.project_id })
  }

  return getTask(taskId)
}
