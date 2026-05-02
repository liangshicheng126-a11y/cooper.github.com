// src/config/redis.js - Redis 客户端（含缓存层加强）
const { createClient } = require('redis')
const logger = require('../utils/logger')

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    reconnectStrategy: (retries) => {
      if (retries > 5) return false   // 超过5次重试后停止，不崩溃
      return Math.min(retries * 500, 3000)
    },
    connectTimeout: 5000,
  },
  password: process.env.REDIS_PASSWORD || undefined,
})

client.on('error', () => {
  if (!client._degradeLogged) {
    logger.warn('⚠️  Redis 不可用，缓存已降级（不影响核心功能）')
    client._degradeLogged = true
  }
})
client.on('connect', () => {
  client._degradeLogged = false
  logger.info('✅ Redis connected')
})

client.connect().catch(() => {})

// ── TTL 配置（秒） ──────────────────────────────────────────
const CACHE_TTL = {
  ACTIVITIES:      60,    // 活动列表：60s（高频读，热点数据）
  ACTIVITY_DETAIL: 30,    // 活动详情：30s（报名数需要较实时）
  REG_COUNT:       15,    // 报名人数：15s（秒杀级活动需更短）
  USER_PROFILE:    600,   // 用户资料：10min
  FEATURED:        120,   // 精选列表：2min
  STATS:           300,   // 统计数据：5min
}

function isReady() {
  return client.isOpen && client.isReady
}

async function getCache(key) {
  if (!isReady()) return null
  try {
    const val = await client.get(key)
    return val ? JSON.parse(val) : null
  } catch { return null }
}

async function setCache(key, value, ttl = 300) {
  if (!isReady()) return
  try { await client.set(key, JSON.stringify(value), { EX: ttl }) } catch {}
}

async function delCache(key) {
  if (!isReady()) return
  try { await client.del(key) } catch {}
}

// 批量删除带前缀的缓存（如活动更新后清除所有列表缓存）
async function delCacheByPattern(pattern) {
  if (!isReady()) return
  try {
    const keys = await client.keys(pattern)
    if (keys.length > 0) await client.del(keys)
  } catch {}
}

async function incrCache(key, ttl = null) {
  if (!isReady()) return 0
  try {
    const val = await client.incr(key)
    if (ttl && val === 1) await client.expire(key, ttl)
    return val
  } catch { return 0 }
}

// ── 带防击穿的缓存读取（同一时刻只有一个请求穿透到 DB） ──────
const _pendingLoads = new Map()

async function getCacheOrLoad(key, loader, ttl = 300) {
  const cached = await getCache(key)
  if (cached !== null) return cached

  // 已有请求在加载中，等待结果
  if (_pendingLoads.has(key)) {
    return _pendingLoads.get(key)
  }

  const promise = loader().then(async (data) => {
    _pendingLoads.delete(key)
    if (data !== null && data !== undefined) {
      await setCache(key, data, ttl)
    }
    return data
  }).catch((err) => {
    _pendingLoads.delete(key)
    throw err
  })

  _pendingLoads.set(key, promise)
  return promise
}

module.exports = {
  client,
  getCache,
  setCache,
  delCache,
  delCacheByPattern,
  incrCache,
  getCacheOrLoad,
  CACHE_TTL,
}
