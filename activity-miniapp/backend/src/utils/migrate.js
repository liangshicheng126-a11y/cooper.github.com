const fs = require('fs')
const path = require('path')
const { pool, authenticate } = require('../config/db')
const logger = require('./logger')

const migrations = [
  '../../../database/migration_activity_moderation.sql',
  '../../../database/migration_wx_group_chat.sql',
  '../../../database/migration_school_rosters.sql',
]

function stripSqlComments(sql) {
  return sql
    .split(/\r?\n/)
    .filter(line => !line.trim().startsWith('--') && !/^USE\s+/i.test(line.trim()))
    .join('\n')
}

function splitStatements(sql) {
  return stripSqlComments(sql)
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
}

async function run() {
  await authenticate()
  for (const rel of migrations) {
    const file = path.resolve(__dirname, rel)
    logger.info(`Running migration ${path.basename(file)}`)
    const statements = splitStatements(fs.readFileSync(file, 'utf8'))
    for (const statement of statements) {
      try {
        await pool.query(statement)
      } catch (e) {
        if (/Duplicate column name|already exists/i.test(e.message)) {
          logger.warn(`Skipped existing migration step: ${e.message}`)
          continue
        }
        throw e
      }
    }
  }
  logger.info('Migrations complete')
  await pool.end()
}

if (require.main === module) {
  run().catch((e) => {
    logger.error(`Migration failed: ${e.message}`, { stack: e.stack })
    process.exit(1)
  })
}

module.exports = { run }
