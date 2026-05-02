// src/controllers/registrationController.js
const { query, queryOne, transaction } = require('../config/db')
const { encrypt, decrypt } = require('../utils/crypto')
const { delCache } = require('../config/redis')
const { v4: uuidv4 } = require('uuid')
const logger = require('../utils/logger')

// 时间冲突检测
function hasConflict(s1, e1, s2, e2) {
  return new Date(s1) < new Date(e2) && new Date(e1) > new Date(s2)
}

exports.create = async (req, res, next) => {
  try {
    const { activityId, subActivityId, customData = {}, forceRegister = false } = req.body
    const { openid } = req.user

    const activity = await queryOne('SELECT * FROM activities WHERE id = ?', [activityId])
    if (!activity) return res.status(404).json({ code: 404, message: '活动不存在' })
    if (activity.status === 'offline' || activity.status === 'cancelled') {
      return res.status(400).json({ code: 400, message: '活动已下架或取消' })
    }

    // 检查是否已报名
    const existing = await queryOne(
      'SELECT id FROM registrations WHERE activity_id = ? AND user_openid = ? AND cancelled_at IS NULL',
      [activityId, openid]
    )
    if (existing) return res.status(400).json({ code: 400, message: '您已报名此活动' })

    // 人数限制检查（使用事务+行锁）
    const id = uuidv4()
    await transaction(async (conn) => {
      // 锁定记录防并发
      const [rows] = await conn.execute(
        'SELECT COUNT(*) AS cnt FROM registrations WHERE activity_id = ? AND cancelled_at IS NULL FOR UPDATE',
        [activityId]
      )
      const cnt = rows[0].cnt
      if (activity.max_participants > 0 && cnt >= activity.max_participants) {
        throw Object.assign(new Error('活动已报满'), { status: 400 })
      }

      // 子活动人数检查
      if (subActivityId) {
        const sub = await queryOne('SELECT * FROM sub_activities WHERE id = ?', [subActivityId])
        if (sub?.max_participants > 0) {
          const [subRows] = await conn.execute(
            'SELECT COUNT(*) AS cnt FROM registrations WHERE sub_activity_id = ? AND cancelled_at IS NULL FOR UPDATE',
            [subActivityId]
          )
          if (subRows[0].cnt >= sub.max_participants) {
            throw Object.assign(new Error('该场次已报满'), { status: 400 })
          }
        }
      }

      // 加密敏感字段
      const encryptedData = {}
      for (const [k, v] of Object.entries(customData)) {
        const field = JSON.parse(activity.custom_fields || '[]').find(f => f.key === k)
        const sensitive = ['phone', 'email', 'idCard', 'name'].includes(field?.type || field?.key)
        encryptedData[k] = sensitive ? encrypt(String(v)) : v
      }

      await conn.execute(
        `INSERT INTO registrations (id, activity_id, sub_activity_id, user_openid, custom_data, force_registered, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [id, activityId, subActivityId || null, openid, JSON.stringify(encryptedData), forceRegister ? 1 : 0]
      )
    })

    await delCache(`activity:${activityId}`)
    res.status(201).json({ code: 0, data: { id }, message: '报名成功' })
  } catch (e) {
    if (e.status) return res.status(e.status).json({ code: e.status, message: e.message })
    next(e)
  }
}

exports.checkConflict = async (req, res, next) => {
  try {
    const { subActivityId, activityId } = req.query
    if (!subActivityId) return res.json({ code: 0, data: { hasConflict: false } })

    const sub = await queryOne('SELECT * FROM sub_activities WHERE id = ?', [subActivityId])
    if (!sub) return res.json({ code: 0, data: { hasConflict: false } })

    // 查询该用户已报名的时间段
    const myRegs = await query(
      `SELECT sa.start_time, sa.end_time, a.name
       FROM registrations r
       LEFT JOIN sub_activities sa ON r.sub_activity_id = sa.id
       LEFT JOIN activities a ON r.activity_id = a.id
       WHERE r.user_openid = ? AND r.cancelled_at IS NULL AND r.activity_id != ?`,
      [req.user.openid, activityId]
    )

    for (const reg of myRegs) {
      if (!reg.start_time) continue
      if (hasConflict(sub.start_time, sub.end_time, reg.start_time, reg.end_time)) {
        return res.json({ code: 0, data: { hasConflict: true, conflictName: reg.name } })
      }
    }

    res.json({ code: 0, data: { hasConflict: false } })
  } catch (e) {
    next(e)
  }
}

exports.cancel = async (req, res, next) => {
  try {
    const { id } = req.params
    const reg = await queryOne('SELECT * FROM registrations WHERE id = ?', [id])
    if (!reg) return res.status(404).json({ code: 404, message: '报名记录不存在' })
    if (reg.user_openid !== req.user.openid) return res.status(403).json({ code: 403, message: '无权限' })
    await query('UPDATE registrations SET cancelled_at = NOW() WHERE id = ?', [id])
    await delCache(`activity:${reg.activity_id}`)
    res.json({ code: 0, message: '取消报名成功' })
  } catch (e) {
    next(e)
  }
}

exports.myRegistrations = async (req, res, next) => {
  try {
    const regs = await query(
      `SELECT r.id AS registrationId, a.id AS activityId, a.name AS activityName,
              a.start_time AS startTime, a.end_time AS endTime, a.cover_image AS coverImage,
              a.location_name AS locationName, a.status, r.checkin_time AS checkinTime, r.created_at
       FROM registrations r
       JOIN activities a ON r.activity_id = a.id
       WHERE r.user_openid = ? AND r.cancelled_at IS NULL
       ORDER BY a.start_time DESC`,
      [req.user.openid]
    )
    res.json({ code: 0, data: regs })
  } catch (e) {
    next(e)
  }
}
