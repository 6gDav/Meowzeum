import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { Database } from 'bun:sqlite'
import { initializeCommunitySchema } from './communitySchema'

const databasePath = process.env.MEOWZEUM_DB_PATH
  ? resolve(process.env.MEOWZEUM_DB_PATH)
  : resolve(import.meta.dir, '../data/meowzeum.sqlite')

mkdirSync(dirname(databasePath), { recursive: true })

export const communityDatabase = new Database(databasePath)

initializeCommunitySchema(communityDatabase)
