import { query, execute, transaction } from './database.js'
import { SEED_DATA } from '../data/seed-data.js'

export function seedIfEmpty() {
  const [{ n }] = query('SELECT COUNT(*) as n FROM users')
  if (n > 0) return

  transaction(() => {
    for (const u of SEED_DATA.users) {
      execute(
        'INSERT INTO users(id, name, role, initials) VALUES (?, ?, ?, ?)',
        [u.id, u.name, u.role, u.initials]
      )
    }

    for (const p of SEED_DATA.projects) {
      execute(
        'INSERT INTO projects(id, name, created_at) VALUES (?, ?, ?)',
        [p.id, p.name, p.created_at]
      )
    }

    for (const m of SEED_DATA.members) {
      execute(
        'INSERT INTO project_members(project_id, user_id) VALUES (?, ?)',
        [m.project_id, m.user_id]
      )
    }

    for (const t of SEED_DATA.tasks) {
      execute(
        `INSERT INTO tasks(id, project_id, title, description, assignee_id, column_key, sort_order, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.id, t.project_id, t.title, t.description ?? null, t.assignee_id ?? null, t.column_key, t.sort_order, t.created_at]
      )
    }
  })
}
