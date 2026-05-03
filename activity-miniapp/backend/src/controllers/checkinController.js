// src/controllers/checkinController.js
const { query, queryOne } = require('../config/db')
const { genCheckinToken, isValidCheckinToken } = require('../utils/checkinToken')
const { delCache, getCache } = require('../config/redis')

exports.checkin = async (req, res, next) => {
  try {
    const { activityId, token } = req.body
    const { openid } = req.user

    if (!isValidCheckinToken(activityId, token)) {
      return res.status(400).json({ code: 400, message: '签到码无效或已过期' })
    }

    const reg = await queryOne(
      'SELECT * FROM registrations WHERE activity_id = ? AND user_openid = ? AND cancelled_at IS NULL',
      [activityId, openid]
    )
    if (!reg) return res.status(400).json({ code: 400, message: '您未报名此活动' })
    if (reg.checkin_time) return res.status(400).json({ code: 400, message: '您已签到' })

    await query('UPDATE registrations SET checkin_time = NOW() WHERE id = ?', [reg.id])

    await delCache(`activity:${activityId}`)

    const activity = await queryOne('SELECT name FROM activities WHERE id = ?', [activityId])
    res.json({ code: 0, data: { activityName: activity?.name }, message: '签到成功' })
  } catch (e) {
    next(e)
  }
}

/** 解析小程序码 scene（个人主体：16 位 hex → Redis 中取 activityId/token） */
exports.resolveCheckinScene = async (req, res, next) => {
  try {
    const code = String(req.params.code || '').trim().toLowerCase()
    if (!/^[0-9a-f]{16}$/.test(code)) {
      return res.status(400).json({ code: 400, message: '无效的签到码' })
    }
    const data = await getCache(`checkin:scene:${code}`)
    if (!data || !data.activityId || !data.token) {
      return res.status(404).json({ code: 404, message: '签到码已过期或无效，请让主办方刷新现场码' })
    }
    res.json({ code: 0, data: { activityId: data.activityId, token: data.token } })
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
