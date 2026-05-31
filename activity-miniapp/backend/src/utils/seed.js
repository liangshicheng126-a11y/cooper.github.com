const { authenticate, pool } = require('../config/db')
const logger = require('./logger')

async function run() {
  await authenticate()
  logger.info('No seed data is required for this project.')
  await pool.end()
}

if (require.main === module) {
  run().catch((e) => {
    logger.error(`Seed failed: ${e.message}`, { stack: e.stack })
    process.exit(1)
  })
}

module.exports = { run }
