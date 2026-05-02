// src/config/db.js - MySQL 连接池（含性能加固）
const mysql  = require('mysql2/promise')
const logger = require('../utils/logger')

// 连接池大小：开发 20，生产建议 50~100（按服务器内存调整）
const POOL_SIZE = parseInt(process.env.DB_POOL_SIZE) || (process.env.NODE_ENV === 'production' ? 50 : 20)

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT) || 3306,
  database:           process.env.DB_NAME     || 'activity_miniapp',
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit:    POOL_SIZE,
  queueLimit:         200,          // 排队超过 200 个请求直接拒绝，防止无限堆积
  connectTimeout:     10000,        // 建立连接超时 10s
  timezone:           '+08:00',
  charset:            'utf8mb4',
  // 连接空闲超过 30s 自动回收，避免"MySQL has gone away"
  idleTimeout:        30000,
  enableKeepAlive:    true,
  keepAliveInitialDelay: 10000,
})

// ── 查询封装（带超时保护） ──────────────────────────────────
const QUERY_TIMEOUT = parseInt(process.env.DB_QUERY_TIMEOUT) || 8000  // 8s 超时

async function query(sql, values) {
  const conn = await pool.getConnection()
  try {
    // 每条查询设置独立超时，防止慢查询拖垮连接池
    await conn.query('SET SESSION max_execution_time = ?', [QUERY_TIMEOUT])
    const [rows] = await conn.execute(sql, values)
    return rows
  } finally {
    conn.release()
  }
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

// ── 连接池状态监控 ──────────────────────────────────────────
function getPoolStats() {
  return {
    total:   pool.pool._allConnections.length,
    free:    pool.pool._freeConnections.length,
    queued:  pool.pool._connectionQueue.length,
    limit:   POOL_SIZE,
  }
}

// 连接池告警：空闲连接不足 20% 时输出警告
setInterval(() => {
  try {
    const s = getPoolStats()
    const usageRate = (s.total - s.free) / s.limit
    if (usageRate > 0.8) {
      logger.warn(`⚠️  DB连接池使用率 ${Math.round(usageRate * 100)}% (${s.total - s.free}/${s.limit})，队列: ${s.queued}`)
    }
    if (s.queued > 50) {
      logger.error(`🔴 DB队列积压 ${s.queued} 个请求，建议扩容 DB_POOL_SIZE`)
    }
  } catch (_) {}
}, 10000)

async function authenticate() {
  try {
    await pool.execute('SELECT 1')
    logger.info(`✅ MySQL connected (pool size: ${POOL_SIZE})`)
  } catch (e) {
    logger.error('❌ MySQL 连接失败：' + e.message)
    logger.error('   请检查：')
    logger.error('   1. MySQL 服务是否启动（Windows：任务管理器 → 服务 → MySQL80）')
    logger.error('   2. backend/.env 中 DB_PASSWORD 是否正确')
    logger.error('   3. 数据库 activity_miniapp 是否已创建（执行 database/schema.sql）')
    process.exit(1)
  }
}

module.exports = { pool, query, queryOne, transaction, authenticate, getPoolStats }
