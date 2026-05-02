// src/controllers/checkinController.js
const { query, queryOne } = require('../config/db')
const { v4: uuidv4 } = require('uuid')
const crypto = require('crypto')

// 生成签到 token（与时间绑定，每小时轮换）
function genCheckinToken(activityId) {
  const hour = Math.floor(Date.now() / 3600000)
  return crypto.createHmac('sha256', process.env.JWT_SECRET)
    .update(`${activityId}:${hour}`)
    .digest('hex')
    .slice(0, 16)
}

exports.checkin = async (req, res, next) => {
  try {
    const { activityId, token } = req.body
    const { openid } = req.user

    const expectedToken = genCheckinToken(activityId)
    // 允许当前和上一小时的 token（防止跨小时失效）
    const prevHourToken = crypto.createHmac('sha256', process.env.JWT_SECRET)
      .update(`${activityId}:${Math.floor(Date.now() / 3600000) - 1}`)
      .digest('hex').slice(0, 16)

    if (token !== expectedToken && token !== prevHourToken) {
      return res.status(400).json({ code: 400, message: '签到码无效或已过期' })
    }

    const reg = await queryOne(
      'SELECT * FROM registrations WHERE activity_id = ? AND user_openid = ? AND cancelled_at IS NULL',
      [activityId, openid]
    )
    if (!reg) return res.status(400).json({ code: 400, message: '您未报名此活动' })
    if (reg.checkin_time) return res.status(400).json({ code: 400, message: '您已签到' })

    await query('UPDATE registrations SET checkin_time = NOW() WHERE id = ?', [reg.id])

    const activity = await queryOne('SELECT name FROM activities WHERE id = ?', [activityId])
    res.json({ code: 0, data: { activityName: activity?.name }, message: '签到成功' })
  } catch (e) {
    next(e)
  }
}

exports.getCheckinQRData = async (req, res, next) => {
  try {
    const { activityId } = req.params
    const token = genCheckinToken(activityId)
    res.json({ code: 0, data: { token, activityId } })
  } catch (e) {
    next(e)
  }
}
