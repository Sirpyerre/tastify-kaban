import sqlite3InitModule from '@sqlite.org/sqlite-wasm'
import { runMigrations } from './migrations.js'
import { seedIfEmpty } from './seed.js'

let db = null

export async function initDatabase({ vfsOverride = null } = {}) {
  const sqlite3 = await sqlite3InitModule({
    print: () => {},
    printErr: () => {},
  })

  if (vfsOverride === ':memory:') {
    db = new sqlite3.oo1.DB(':memory:', 'c')
  } else {
    try {
      const poolUtil = await sqlite3.installOpfsSAHPoolVfs()
      db = new poolUtil.OpfsSAHPoolDb('/taskify.db')
    } catch {
      // OPFS unavailable (headless test browsers, some Safari versions)
      console.warn('[Taskify] OPFS unavailable — using in-memory storage (data will not persist)')
      db = new sqlite3.oo1.DB(':memory:', 'c')
    }
  }

  // FK enforcement is per-connection in SQLite — must run after every open
  db.exec('PRAGMA foreign_keys = ON')

  runMigrations()
  seedIfEmpty()

  console.info('[Taskify] Database initialized successfully')
}

export function query(sql, params = []) {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.')
  return db.selectObjects(sql, params)
}

export function execute(sql, params = []) {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.')
  db.exec({ sql, bind: params.length ? params : undefined })
}

export function transaction(operations) {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.')
  db.transaction(operations)
}
