// src/middleware/auth.js - JWT 鉴权中间件
const jwt = require('jsonwebtoken')
const { queryOne } = require('../config/db')

async function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '请先登录' })
  }
  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    next()
  } catch (e) {
    return res.status(401).json({ code: 401, message: 'Token 已过期，请重新登录' })
  }
}

async function adminOnly(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ code: 403, message: '无权限操作' })
  }
  next()
}

// 软鉴权：有 token 则解析，无 token 也放行
async function softAuth(req, res, next) {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    } catch (e) {}
  }
  next()
}

module.exports = { auth, adminOnly, softAuth }
