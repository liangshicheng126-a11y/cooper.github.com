// src/config/redis.js - Redis 客户端（支持无 Redis 降级运行）
const { createClient } = require('redis')
const logger = require('../utils/logger')

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    reconnectStrategy: (retries) => {
      if (retries > 3) return false   // 超过3次重试后停止，不崩溃
      return Math.min(retries * 500, 2000)
    },
  },
  password: process.env.REDIS_PASSWORD || undefined,
})

client.on('error', (err) => {
  // 只打 warn，不让进程崩溃
  if (!client._degradeLogged) {
    logger.warn('⚠️  Redis 不可用，缓存已降级（不影响核心功能）')
    client._degradeLogged = true
  }
})
client.on('connect', () => {
  client._degradeLogged = false
  logger.info('✅ Redis connected')
})

// 静默连接，失败不抛出
client.connect().catch(() => {})

const CACHE_TTL = {
  ACTIVITIES: 300,
  ACTIVITY_DETAIL: 60,
  REG_COUNT: 30,
  USER_PROFILE: 600,
  FEATURED: 600,
}

function isReady() {
  return client.isOpen && client.isReady
}

async function getCache(key) {
  if (!isReady()) return null
  try {
    const val = await client.get(key)
    return val ? JSON.parse(val) : null
  } catch (e) { return null }
}

async function setCache(key, value, ttl = 300) {
  if (!isReady()) return
  try { await client.set(key, JSON.stringify(value), { EX: ttl }) } catch (e) {}
}

async function delCache(key) {
  if (!isReady()) return
  try { await client.del(key) } catch (e) {}
}

async function incrCache(key, ttl = null) {
  if (!isReady()) return 0
  try {
    const val = await client.incr(key)
    if (ttl && val === 1) await client.expire(key, ttl)
    return val
  } catch (e) { return 0 }
}

module.exports = { client, getCache, setCache, delCache, incrCache, CACHE_TTL }
