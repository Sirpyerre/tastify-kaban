import { query, execute } from '../db/database.js'
import { generateId } from '../utils/id.js'
import { nowUnix } from '../utils/time.js'
import { EventBus, PROJECT_LIST_UPDATED } from '../utils/event-bus.js'

export function getProjectsForUser(userId) {
  return query(
    `SELECT p.* FROM projects p
     JOIN project_members m ON m.project_id = p.id
     WHERE m.user_id = ?
     ORDER BY p.created_at DESC`,
    [userId]
  )
}

export function getProject(id) {
  const rows = query('SELECT * FROM projects WHERE id = ?', [id])
  return rows[0] ?? null
}

export function createProject(name) {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Project name cannot be empty')

  const id = generateId()
  const created_at = nowUnix()
  execute(
    'INSERT INTO projects(id, name, created_at) VALUES (?, ?, ?)',
    [id, trimmed, created_at]
  )

  EventBus.emit(PROJECT_LIST_UPDATED)
  return { id, name: trimmed, created_at }
}

export function getMembers(projectId) {
  return query(
    `SELECT u.* FROM users u
     JOIN project_members m ON m.user_id = u.id
     WHERE m.project_id = ?
     ORDER BY CASE u.role WHEN 'product_manager' THEN 0 ELSE 1 END, u.name`,
    [projectId]
  )
}

export function addMember(projectId, userId) {
  execute(
    'INSERT OR IGNORE INTO project_members(project_id, user_id) VALUES (?, ?)',
    [projectId, userId]
  )
  EventBus.emit(PROJECT_LIST_UPDATED)
}

export function removeMember(projectId, userId) {
  execute(
    'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
    [projectId, userId]
  )
  EventBus.emit(PROJECT_LIST_UPDATED)
}

export function isMember(projectId, userId) {
  const rows = query(
    'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?',
    [projectId, userId]
  )
  return rows.length > 0
}
