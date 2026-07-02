import { query } from '../db/database.js'

let currentUser = null

export function getAllUsers() {
  return query(
    `SELECT * FROM users
     ORDER BY CASE role WHEN 'product_manager' THEN 0 ELSE 1 END, name`
  )
}

export function getUser(id) {
  const rows = query('SELECT * FROM users WHERE id = ?', [id])
  return rows[0] ?? null
}

export function getCurrentUser() {
  return currentUser
}

export function setCurrentUser(id) {
  const user = getUser(id)
  if (!user) throw new Error(`User not found: ${id}`)
  currentUser = user
}

export function clearCurrentUser() {
  currentUser = null
}
