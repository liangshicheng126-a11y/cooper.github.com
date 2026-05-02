// src/app.js - 应用入口
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const logger = require('./utils/logger')
const db = require('./config/db')
const redis = require('./config/redis')
require('./jobs/reminderJob')

const app = express()

// ===== 安全中间件 =====
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : '*',
  credentials: true,
}))

// 全局限流
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 200,
  message: { code: 429, message: '请求过于频繁，请稍后再试' },
}))

app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))

// ===== 路由 =====
app.use('/api/auth',         require('./routes/auth'))
app.use('/api/activities',   require('./routes/activities'))
app.use('/api/registrations',require('./routes/registrations'))
app.use('/api/admin',        require('./routes/admin'))
app.use('/api/ai',           require('./routes/ai'))
app.use('/api/checkin',      require('./routes/checkin'))
app.use('/api/upload',       require('./routes/upload'))

// ===== 健康检查 =====
app.get('/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }))

// ===== 开发辅助：查看微信登录后的 openid（仅开发模式可用） =====
if (process.env.NODE_ENV !== 'production') {
  app.get('/dev/openid', require('./middleware/auth').auth, (req, res) => {
    res.json({ code: 0, openid: req.user.openid, message: '将此 openid 填入 .env 的 ADMIN_OPENIDS' })
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

const PORT = process.env.PORT || 3000
app.listen(PORT, async () => {
  await db.authenticate()
  logger.info(`✅ Server running on port ${PORT}`)
})

module.exports = app
