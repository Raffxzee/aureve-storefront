import { mkdir, readdir, unlink } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import Database from 'better-sqlite3'

const projectDirectory = resolve(fileURLToPath(new URL('..', import.meta.url)))
const databasePath = resolve(process.env.DATABASE_PATH || `${projectDirectory}/data/aureve.sqlite`)
const backupDirectory = resolve(process.env.BACKUP_DIRECTORY || `${projectDirectory}/backups`)
const backupRetention = Number(process.env.BACKUP_RETENTION || 14)
const timestamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
const backupPath = resolve(backupDirectory, `aureve-${timestamp}.sqlite`)

await mkdir(backupDirectory, { recursive: true })
if (!Number.isInteger(backupRetention) || backupRetention < 1 || backupRetention > 365) {
  throw new Error('BACKUP_RETENTION must be a whole number between 1 and 365.')
}
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

const backupFiles = (await readdir(backupDirectory))
  .filter((file) => /^aureve-\d{4}-\d{2}-\d{2}T.*\.sqlite$/.test(file))
  .sort()
const staleFiles = backupFiles.slice(0, Math.max(0, backupFiles.length - backupRetention))
await Promise.all(staleFiles.map((file) => unlink(resolve(backupDirectory, file))))
if (staleFiles.length > 0) console.log(`Removed ${staleFiles.length} backup(s) beyond retention.`)
