// src/controllers/authController.js
const jwt = require('jsonwebtoken')
const axios = require('axios')
const { query, queryOne } = require('../config/db')
const { encrypt, decrypt } = require('../utils/crypto')
const logger = require('../utils/logger')

const ADMIN_OPENIDS = (process.env.ADMIN_OPENIDS || '').split(',').filter(Boolean)

const WX_LOGIN_ERR_HINTS = {
  40013: '小程序 AppID 与后端不一致：请确认微信开发者工具 AppID 与 backend/.env 中 WX_APP_ID 相同',
  40125: 'AppSecret 无效：请检查 backend/.env 中 WX_APP_SECRET',
  40029: '登录码无效或已过期，请关闭小程序后重新打开',
  45011: '登录过于频繁，请稍后再试',
  '-1': '微信服务繁忙，请稍后重试',
}

function wxLoginErrorMessage(data) {
  const hint = WX_LOGIN_ERR_HINTS[String(data.errcode)]
  if (hint) return hint
  return `微信登录失败: ${data.errmsg || data.errcode}`
}

async function wxCode2Session(code) {
  if (!process.env.WX_APP_ID || !process.env.WX_APP_SECRET) {
    const err = new Error('服务端未配置 WX_APP_ID / WX_APP_SECRET，请编辑 backend/.env')
    err.status = 503
    throw err
  }
  const { data } = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
    params: {
      appid: process.env.WX_APP_ID,
      secret: process.env.WX_APP_SECRET,
      js_code: code,
      grant_type: 'authorization_code',
    },
    timeout: 15000,
  })
  if (data.errcode) {
    const err = new Error(wxLoginErrorMessage(data))
    err.status = 400
    throw err
  }
  return data
}

exports.login = async (req, res, next) => {
  try {
    const { code } = req.body
    if (!code) return res.status(400).json({ code: 400, message: '缺少 code' })

    const wxData = await wxCode2Session(code)
    const { openid, session_key } = wxData

    let user = await queryOne('SELECT * FROM users WHERE openid = ?', [openid])

    if (!user) {
      // 新用户注册
      await query(
        `INSERT INTO users SET openid=?, nickname=?, avatar_url=?, privacy_agreed_at=?, created_at=?`,
        [openid, '微信用户', '', new Date(), new Date()]
      )
      user = await queryOne('SELECT * FROM users WHERE openid = ?', [openid])
    }

    const isAdmin = ADMIN_OPENIDS.includes(openid)
    const token = jwt.sign(
      { openid, userId: user.id, isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    )

    res.json({
      code: 0,
      data: {
        token,
        openid,
        user: {
          id: user.id,
          openid,
          nickName: user.nickname,
          avatarUrl: user.avatar_url,
          isAdmin,
        },
      },
    })
  } catch (e) {
    next(e)
  }
}

exports.getProfile = async (req, res, next) => {
  try {
    const user = await queryOne('SELECT id, openid, nickname, avatar_url, created_at FROM users WHERE openid = ?', [req.user.openid])
    if (!user) return res.status(404).json({ code: 404, message: '用户不存在' })
    res.json({
      code: 0,
      data: {
        ...user,
        nickName: user.nickname,
        avatarUrl: user.avatar_url,
        isAdmin: ADMIN_OPENIDS.includes(user.openid),
      },
    })
  } catch (e) {
    next(e)
  }
}

exports.deleteAccount = async (req, res, next) => {
  try {
    const { openid } = req.user
    // 匿名化处理而非物理删除
    await query(
      `UPDATE users SET openid = CONCAT('deleted_', id), nickname = '已注销用户', avatar_url = '', deleted_at = NOW() WHERE openid = ?`,
      [openid]
    )
    await query('DELETE FROM registrations WHERE user_openid = ?', [openid])
    res.json({ code: 0, message: '账号已注销' })
  } catch (e) {
    next(e)
  }
}

exports.exportData = async (req, res, next) => {
  try {
    const { openid } = req.user
    const activities = await query('SELECT * FROM activities WHERE creator_openid = ?', [openid])
    const registrations = await query('SELECT * FROM registrations WHERE user_openid = ?', [openid])
    // 实际应生成文件，这里简化返回链接
    res.json({ code: 0, data: { downloadUrl: 'https://your-domain.com/exports/user-data-temp.json' } })
  } catch (e) {
    next(e)
  }
}
