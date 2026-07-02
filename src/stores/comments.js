import { query, execute } from '../db/database.js'
import { generateId } from '../utils/id.js'
import { nowUnix } from '../utils/time.js'
import { EventBus, COMMENT_UPDATED } from '../utils/event-bus.js'

export function getComments(taskId) {
  return query(
    `SELECT c.*, u.name as author_name
     FROM comments c
     JOIN users u ON u.id = c.author_id
     WHERE c.task_id = ?
     ORDER BY c.created_at ASC`,
    [taskId]
  )
}

export function addComment(taskId, authorId, body) {
  const trimmed = body.trim()
  if (!trimmed) throw new Error('Comment body cannot be empty')

  const id = generateId()
  const now = nowUnix()
  execute(
    'INSERT INTO comments(id, task_id, author_id, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, taskId, authorId, trimmed, now, now]
  )

  EventBus.emit(COMMENT_UPDATED, { taskId })
  return getComments(taskId).find(c => c.id === id)
}

export function editComment(commentId, requestingUserId, newBody) {
  const comment = getCommentById(commentId)
  if (!comment) throw new Error(`Comment not found: ${commentId}`)
  if (comment.author_id !== requestingUserId) {
    throw new Error('Cannot edit a comment you did not author')
  }

  const trimmed = newBody.trim()
  if (!trimmed) throw new Error('Comment body cannot be empty')

  const now = nowUnix()
  execute(
    'UPDATE comments SET body = ?, updated_at = ? WHERE id = ?',
    [trimmed, now, commentId]
  )

  EventBus.emit(COMMENT_UPDATED, { taskId: comment.task_id })
  return getCommentById(commentId)
}

export function deleteComment(commentId, requestingUserId) {
  const comment = getCommentById(commentId)
  if (!comment) throw new Error(`Comment not found: ${commentId}`)
  if (comment.author_id !== requestingUserId) {
    throw new Error('Cannot delete a comment you did not author')
  }

  execute('DELETE FROM comments WHERE id = ?', [commentId])
  EventBus.emit(COMMENT_UPDATED, { taskId: comment.task_id })
}

export function canModifyComment(comment, userId) {
  return comment.author_id === userId
}

function getCommentById(id) {
  const rows = query('SELECT * FROM comments WHERE id = ?', [id])
  return rows[0] ?? null
}
