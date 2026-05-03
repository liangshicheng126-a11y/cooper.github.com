// src/controllers/checkinController.js
const { query, queryOne } = require('../config/db')
const { genCheckinToken, isValidCheckinToken } = require('../utils/checkinToken')
const { delCache } = require('../config/redis')

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

exports.getCheckinQRData = async (req, res, next) => {
  try {
    const { activityId } = req.params
    const token = genCheckinToken(activityId)
    res.json({ code: 0, data: { token, activityId } })
  } catch (e) {
    next(e)
  }
}
