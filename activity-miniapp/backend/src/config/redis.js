// src/config/redis.js - Redis 客户端
const { createClient } = require('redis')
const logger = require('../utils/logger')

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  password: process.env.REDIS_PASSWORD || undefined,
})

client.on('error', (err) => logger.error('Redis error:', err))
client.on('connect', () => logger.info('✅ Redis connected'))

client.connect().catch(err => logger.error('Redis connect failed:', err))

const CACHE_TTL = {
  ACTIVITIES: 300,         // 5 分钟
  ACTIVITY_DETAIL: 60,     // 1 分钟
  REG_COUNT: 30,           // 30 秒
  USER_PROFILE: 600,       // 10 分钟
  FEATURED: 600,
}

async function getCache(key) {
  try {
    const val = await client.get(key)
    return val ? JSON.parse(val) : null
  } catch (e) {
    return null
  }
}

async function setCache(key, value, ttl = 300) {
  try {
    await client.set(key, JSON.stringify(value), { EX: ttl })
  } catch (e) {}
}

async function delCache(key) {
  try { await client.del(key) } catch (e) {}
}

async function incrCache(key, ttl = null) {
  try {
    const val = await client.incr(key)
    if (ttl && val === 1) await client.expire(key, ttl)
    return val
  } catch (e) { return 0 }
}

module.exports = { client, getCache, setCache, delCache, incrCache, CACHE_TTL }
