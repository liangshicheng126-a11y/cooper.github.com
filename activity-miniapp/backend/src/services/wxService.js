// src/services/wxService.js - 微信服务
const axios = require('axios')
const { getCache, setCache } = require('../config/redis')
const { query } = require('../config/db')
const logger = require('../utils/logger')

function skipContentModeration() {
  return process.env.NODE_ENV === 'development' || process.env.SKIP_CONTENT_MODERATION === '1'
}

async function getAccessToken() {
  const cached = await getCache('wx:access_token')
  if (cached) return cached

  const { data } = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
    params: {
      grant_type: 'client_credential',
      appid: process.env.WX_APP_ID,
      secret: process.env.WX_APP_SECRET,
    },
  })
  if (data.access_token) {
    await setCache('wx:access_token', data.access_token, data.expires_in - 300)
    return data.access_token
  }
  throw new Error('获取 access_token 失败: ' + data.errmsg)
}

/** 微信 msg_sec_check 单段长度限制较严，分段送检 */
const MSG_SEC_CHUNK = 800

async function msgSecCheckSingle(content) {
  const trimmed = typeof content === 'string' ? content.trim() : ''
  if (!trimmed || skipContentModeration()) return
  try {
    const token = await getAccessToken()
    const { data } = await axios.post(
      `https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${token}`,
      { content: trimmed.slice(0, 2490) }
    )
    if (data.errcode !== 0) {
      logger.warn('[msg_sec_check]', data.errcode, data.errmsg)
      throw new Error(`内容未通过安全检查：${data.errmsg || '请修改后重新提交'}`)
    }
  } catch (e) {
    if (e.message.includes('安全检查')) throw e
    logger.error('msg_sec_check failed:', e.message)
    throw new Error('内容安全校验服务暂不可用，请稍后重试')
  }
}

// 文本内容安全检测（整块；长文请用 moderateActivityPublish）
async function checkText(content) {
  if (!content || skipContentModeration()) return true
  const s = typeof content === 'string' ? content : String(content)
  for (let i = 0; i < s.length; i += MSG_SEC_CHUNK) {
    const piece = s.slice(i, i + MSG_SEC_CHUNK).trim()
    if (piece) await msgSecCheckSingle(piece)
  }
  return true
}

/** 上架前：聚合所有可读文本分段送检 + 封面图 */
async function moderateActivityPublish(payload) {
  if (skipContentModeration()) return
  const parts = []
  const push = (v) => {
    if (v == null) return
    const t = String(v).trim()
    if (t) parts.push(t)
  }

  push(payload.name)
  push(payload.description)
  push(payload.reminder)
  push(payload.locationName)
  push(payload.locationAddress)

  const fields = Array.isArray(payload.customFields) ? payload.customFields : []
  for (const f of fields) {
    push(f.label)
    if (Array.isArray(f.options)) f.options.forEach((o) => push(o))
    else if (typeof f.optionsStr === 'string') {
      f.optionsStr.split(/[,，]/).map(s => s.trim()).filter(Boolean).forEach(push)
    }
  }

  const subs = Array.isArray(payload.subActivities) ? payload.subActivities : []
  for (const s of subs) {
    push(s.name)
    push(s.locationName)
  }

  const blob = parts.join('\n')
  for (let i = 0; i < blob.length; i += MSG_SEC_CHUNK) {
    const piece = blob.slice(i, i + MSG_SEC_CHUNK).trim()
    if (piece) await msgSecCheckSingle(piece)
  }

  const cover = (payload.coverImage || '').trim()
  if (cover) await checkImage(cover)
}

// 图片安全检测
async function checkImage(imageUrl) {
  if (!imageUrl || skipContentModeration()) return true
  try {
    const token = await getAccessToken()
    const { data } = await axios.post(
      `https://api.weixin.qq.com/wxa/img_sec_check?access_token=${token}`,
      { media_url: imageUrl }
    )
    if (data.errcode !== 0) {
      logger.warn('[img_sec_check]', data.errcode, data.errmsg)
      throw new Error(`图片未通过安全检查：${data.errmsg || '请更换封面后重试'}`)
    }
    return true
  } catch (e) {
    if (e.message.includes('安全检查')) throw e
    logger.error('img_sec_check failed:', e.message)
    throw new Error('图片安全校验服务暂不可用，请稍后重试')
  }
}

// 发送订阅消息
async function sendSubscribeMessage(openid, templateId, data, page) {
  if (process.env.NODE_ENV === 'development') {
    logger.info(`[DEV] sendSubscribeMessage to ${openid}`, { templateId, data })
    return
  }
  try {
    const token = await getAccessToken()
    await axios.post(
      `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${token}`,
      { touser: openid, template_id: templateId, page: page || '/', data }
    )
  } catch (e) {
    logger.error('sendSubscribeMessage failed:', e.message)
  }
}

// 通知所有报名者
async function notifyAllRegistrants(activityId, message) {
  const registrants = await query(
    'SELECT user_openid FROM registrations WHERE activity_id = ? AND cancelled_at IS NULL',
    [activityId]
  )
  const templateId = process.env.WX_TMPL_NOTIFY || 'YOUR_TEMPLATE_ID'
  for (const r of registrants) {
    await sendSubscribeMessage(r.user_openid, templateId, {
      thing1: { value: message.slice(0, 20) },
      time2: { value: new Date().toLocaleString('zh-CN') },
    })
  }
}

// 通知管理员
async function notifyAdmins(message) {
  const adminOpenids = (process.env.ADMIN_OPENIDS || '').split(',').filter(Boolean)
  for (const openid of adminOpenids) {
    await sendSubscribeMessage(openid, process.env.WX_TMPL_ADMIN || 'YOUR_ADMIN_TEMPLATE', {
      thing1: { value: message.slice(0, 20) },
    })
  }
}

/** 生成 URL Link（https://wxaurl.cn/...），可用普通二维码承载；微信原生扫一扫可打开小程序并带上 query */
async function generateUrlLink({ path, query }) {
  const accessToken = await getAccessToken()
  const { data } = await axios.post(
    `https://api.weixin.qq.com/wxa/generate_urllink?access_token=${accessToken}`,
    {
      path,
      query,
      env_version: process.env.WX_MINI_ENV_VERSION || 'release',
      is_expire: false,
    }
  )
  if (data.errcode && data.errcode !== 0) {
    logger.warn('[generate_urllink]', data.errcode, data.errmsg)
    throw new Error(data.errmsg || '生成签到链接失败')
  }
  if (!data.url_link) {
    throw new Error('微信未返回 url_link')
  }
  return data.url_link
}

/**
 * 无数量限制小程序码（scene 最多 32 字符，仅 [0-9a-zA-Z] 等）。
 * 个人主体无法用 URL Link 时，用短 scene + 服务端 Redis 映射 activityId/token。
 */
async function generateUnlimitedWxacodeBuffer(scene) {
  const accessToken = await getAccessToken()
  const sceneStr = String(scene).replace(/[^0-9A-Za-z]/g, '').slice(0, 32)
  if (!sceneStr) throw new Error('scene 无效')
  const { data } = await axios.post(
    `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`,
    {
      scene: sceneStr,
      page: 'pages/checkin/index',
      width: 430,
      env_version: process.env.WX_MINI_ENV_VERSION || 'release',
    },
    { responseType: 'arraybuffer' }
  )
  const buf = Buffer.from(data)
  if (buf.length > 0 && buf[0] === 0x7b) {
    try {
      const j = JSON.parse(buf.toString('utf8'))
      throw new Error(j.errmsg || `微信错误 ${j.errcode}`)
    } catch (e) {
      if (e instanceof SyntaxError) return buf
      throw e
    }
  }
  return buf
}

// 生成小程序码
async function generateMiniQRCode(scene) {
  try {
    const token = await getAccessToken()
    const { data } = await axios.post(
      `https://api.weixin.qq.com/wxa/getwxacode?access_token=${token}`,
      { scene, page: 'pages/checkin/index', width: 430 },
      { responseType: 'arraybuffer' }
    )
    const base64 = Buffer.from(data).toString('base64')
    return `data:image/png;base64,${base64}`
  } catch (e) {
    logger.error('Generate QR failed:', e.message)
    // 降级使用 qrcode 本地生成
    const QRCode = require('qrcode')
    return await QRCode.toDataURL(`https://your-domain.com/checkin?scene=${scene}`)
  }
}

module.exports = {
  getAccessToken,
  skipContentModeration,
  checkText,
  checkImage,
  moderateActivityPublish,
  sendSubscribeMessage,
  notifyAllRegistrants,
  notifyAdmins,
  generateMiniQRCode,
  generateUrlLink,
  generateUnlimitedWxacodeBuffer,
}
