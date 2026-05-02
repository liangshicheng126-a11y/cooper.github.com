// src/services/wxService.js - 微信服务
const axios = require('axios')
const { getCache, setCache } = require('../config/redis')
const { query } = require('../config/db')
const logger = require('../utils/logger')

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

// 文本内容安全检测
async function checkText(content) {
  if (process.env.NODE_ENV === 'development') return true
  try {
    const token = await getAccessToken()
    const { data } = await axios.post(
      `https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${token}`,
      { content }
    )
    if (data.errcode !== 0) throw new Error(`内容违规: ${data.errmsg}`)
    return true
  } catch (e) {
    logger.warn('Text check failed:', e.message)
    if (e.message.includes('违规')) throw e
    return true
  }
}

// 图片安全检测
async function checkImage(imageUrl) {
  if (process.env.NODE_ENV === 'development') return true
  try {
    const token = await getAccessToken()
    const { data } = await axios.post(
      `https://api.weixin.qq.com/wxa/img_sec_check?access_token=${token}`,
      { media_url: imageUrl }
    )
    if (data.errcode !== 0) throw new Error(`图片违规: ${data.errmsg}`)
    return true
  } catch (e) {
    logger.warn('Image check failed:', e.message)
    if (e.message.includes('违规')) throw e
    return true
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

module.exports = { getAccessToken, checkText, checkImage, sendSubscribeMessage, notifyAllRegistrants, notifyAdmins, generateMiniQRCode }
