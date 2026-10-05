import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import Database from 'better-sqlite3'

const projectDirectory = resolve(fileURLToPath(new URL('..', import.meta.url)))
const databasePath = resolve(process.env.DATABASE_PATH || `${projectDirectory}/data/aureve.sqlite`)
const backupDirectory = resolve(process.env.BACKUP_DIRECTORY || `${projectDirectory}/backups`)
const timestamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
const backupPath = resolve(backupDirectory, `aureve-${timestamp}.sqlite`)

await mkdir(backupDirectory, { recursive: true })
const database = new Database(databasePath, { fileMustExist: true })
try {
  await database.backup(backupPath)
} finally {
  database.close()
}

const backup = new Database(backupPath, { readonly: true, fileMustExist: true })
try {
  const check = backup.pragma('quick_check', { simple: true })
  if (check !== 'ok') throw new Error(`Backup integrity check failed: ${check}`)
} finally {
  backup.close()
}

console.log(`SQLite backup verified: ${backupPath}`)
