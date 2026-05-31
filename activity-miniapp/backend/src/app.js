// src/app.js - 应用入口
require('dotenv').config()
const path      = require('path')
const express   = require('express')
const cors      = require('cors')
const helmet    = require('helmet')
const rateLimit = require('express-rate-limit')
const logger    = require('./utils/logger')
const db        = require('./config/db')
const { connectRedis } = require('./config/redis')

const app = express()

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}

// ===== 安全中间件 =====
// 小程序/模拟器会以跨源方式拉取 /uploads 静态图；默认 same-origin 会触发 ERR_BLOCKED_BY_RESPONSE
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : '*',
  credentials: true,
}))

// ── 分级限流配置 ────────────────────────────────────────────
// 辅助：按 openid 或 IP 识别用户
const keyByUser = (req) => req.headers['x-user-openid'] || req.ip

// ① 全局兜底：每 IP 15 分钟内最多 600 次（约 0.67 次/秒，正常浏览绰绰有余）
const globalLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  keyGenerator: keyByUser,
  message: { code: 429, message: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
})

// ② 登录接口：每 IP 1 分钟内最多 10 次（防止暴力调 wx.login）
const authLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: keyByUser,
  message: { code: 429, message: '登录过于频繁，请稍后再试' },
})

// ③ 写操作（报名/创建）：每用户 1 分钟内最多 20 次
const writeLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: keyByUser,
  message: { code: 429, message: '操作过于频繁，请稍后再试' },
})

// ④ AI/上传：每用户 1 分钟内最多 5 次（成本敏感接口）
const heavyLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: keyByUser,
  message: { code: 429, message: '请求太频繁，请 1 分钟后再试' },
})

app.use(globalLimit)
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))

// 开发环境本地上传封面（/api/upload/image 写入 public/uploads）
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  next()
}, express.static(path.join(__dirname, '../public/uploads')))

// ===== 路由（各接口独立限流） =====
app.use('/api/auth',          authLimit,  require('./routes/auth'))
app.use('/api/activities',    require('./routes/activities'))
app.use('/api/registrations', writeLimit, require('./routes/registrations'))
app.use('/api/admin',         writeLimit, require('./routes/admin'))
app.use('/api/ai',            heavyLimit, require('./routes/ai'))
app.use('/api/checkin',       writeLimit, require('./routes/checkin'))
app.use('/api/upload',        heavyLimit, require('./routes/upload'))

// ===== 健康检查（含连接池状态） =====
function healthPayload() {
  const stats = db.getPoolStats ? db.getPoolStats() : {}
  return { status: 'ok', ts: Date.now(), db: stats }
}

app.get('/health', (req, res) => {
  res.json(healthPayload())
})

app.get('/api/health', (req, res) => {
  res.json({ code: 0, data: healthPayload() })
})

// ===== 开发辅助 =====
if (process.env.NODE_ENV !== 'production') {
  app.get('/dev/openid', require('./middleware/auth').auth, (req, res) => {
    res.json({ code: 0, openid: req.user?.openid, message: '将此 openid 填入 .env 的 ADMIN_OPENIDS' })
  })
}

// ===== 错误处理 =====
app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.path} - ${err.message}`, { stack: err.stack })
  const status = err.status || 500
  res.status(status).json({
    code: status,
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message,
  })
})

async function start() {
  await connectRedis()
  if (process.env.START_REMINDER_JOB !== '0' && !process.env.CLUSTER_WORKER) {
    require('./jobs/reminderJob')
  }
  const PORT = process.env.PORT || 3000
  const server = app.listen(PORT, async () => {
    await db.authenticate()
    logger.info(`✅ Server running on port ${PORT}`)
  })
  return server
}

if (require.main === module) {
  start()
}

module.exports = app
module.exports.start = start
