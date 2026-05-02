// src/config/db.js - MySQL 连接池
const mysql = require('mysql2/promise')
const logger = require('../utils/logger')

const pool = mysql.createPool({
  host:     process.env.DB_HOST || 'localhost',
  port:     process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'activity_miniapp',
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  timezone: '+08:00',
  charset: 'utf8mb4',
})

async function query(sql, values) {
  const [rows] = await pool.execute(sql, values)
  return rows
}

async function queryOne(sql, values) {
  const rows = await query(sql, values)
  return rows[0] || null
}

async function transaction(fn) {
  const conn = await pool.getConnection()
  await conn.beginTransaction()
  try {
    const result = await fn(conn)
    await conn.commit()
    return result
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}

async function authenticate() {
  try {
    await pool.execute('SELECT 1')
    logger.info('✅ MySQL connected')
  } catch (e) {
    logger.error('❌ MySQL connection failed:', e.message)
    process.exit(1)
  }
}

module.exports = { pool, query, queryOne, transaction, authenticate }
