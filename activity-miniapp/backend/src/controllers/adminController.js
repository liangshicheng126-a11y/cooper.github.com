// src/controllers/adminController.js
const { query, queryOne } = require('../config/db')
const { parseJsonArray, parseJsonObject } = require('../utils/parseJsonField')
const { decrypt, maskPhone, maskIdCard, maskEmail, maskName, genVerifyCode } = require('../utils/crypto')
const { getCache, setCache, delCache } = require('../config/redis')
const XLSX = require('xlsx')
const logger = require('../utils/logger')

exports.getRegistrations = async (req, res, next) => {
  try {
    const { activityId } = req.params
    const activity = await queryOne('SELECT * FROM activities WHERE id = ?', [activityId])
    if (!activity || activity.creator_openid !== req.user.openid) {
      return res.status(403).json({ code: 403, message: '无权限' })
    }

    const regs = await query(
      `SELECT r.id, r.user_openid, r.sub_activity_id, r.custom_data, r.checkin_time, r.created_at,
              u.nickname, u.avatar_url
       FROM registrations r
       JOIN users u ON r.user_openid = u.openid
       WHERE r.activity_id = ? AND r.cancelled_at IS NULL
       ORDER BY r.created_at`,
      [activityId]
    )

    const customFields = parseJsonArray(activity.custom_fields, [])
    const result = regs.map(r => {
      const customData = parseJsonObject(r.custom_data, {})

      // 脱敏处理
      const maskedData = {}
      for (const [k, v] of Object.entries(customData)) {
        const field = customFields.find(f => f.key === k)
        const decrypted = decrypt(v) || v
        if (field?.type === 'phone') maskedData[k] = maskPhone(decrypted)
        else if (field?.type === 'idCard') maskedData[k] = maskIdCard(decrypted)
        else if (field?.type === 'email') maskedData[k] = maskEmail(decrypted)
        else if (field?.type === 'name' || field?.key === 'name') maskedData[k] = maskName(decrypted)
        else maskedData[k] = decrypted
      }

      return {
        id: r.id,
        userOpenid: r.user_openid,
        subActivityId: r.sub_activity_id,
        nickname: r.nickname,
        avatarUrl: r.avatar_url,
        maskedData,
        checkinTime: r.checkin_time,
        createdAt: r.created_at,
      }
    })

    res.json({ code: 0, data: result })
  } catch (e) {
    next(e)
  }
}

exports.revealRegistration = async (req, res, next) => {
  try {
    const { id } = req.params
    const reg = await queryOne(
      `SELECT r.*, a.custom_fields, a.creator_openid FROM registrations r
       JOIN activities a ON r.activity_id = a.id WHERE r.id = ?`,
      [id]
    )
    if (!reg || reg.creator_openid !== req.user.openid) {
      return res.status(403).json({ code: 403, message: '无权限' })
    }

    const customData = parseJsonObject(reg.custom_data, {})
    const customFields = parseJsonArray(reg.custom_fields, [])

    const decryptedData = {}
    const fieldLabels = {}
    for (const [k, v] of Object.entries(customData)) {
      decryptedData[k] = decrypt(v) || v
    }
    customFields.forEach(f => { fieldLabels[f.key] = f.label })

    // 审计日志已由中间件记录
    res.json({ code: 0, data: { customData: decryptedData, fieldLabels } })
  } catch (e) {
    next(e)
  }
}

exports.sendVerifyCode = async (req, res, next) => {
  try {
    const { activityId } = req.body
    const code = genVerifyCode()
    await setCache(`verify:${req.user.openid}:export`, code, 300) // 5 分钟有效

    // 生产环境发送短信，开发环境返回 code
    if (process.env.NODE_ENV === 'development') {
      return res.json({ code: 0, data: { devCode: code }, message: '验证码已发送（dev模式）' })
    }

    // TODO: 调用腾讯云 SMS 发送短信
    res.json({ code: 0, message: '验证码已发送至您的手机' })
  } catch (e) {
    next(e)
  }
}

exports.exportRegistrations = async (req, res, next) => {
  try {
    const { activityId, subActivityId, code } = req.body

    // 验证码校验
    const savedCode = await getCache(`verify:${req.user.openid}:export`)
    if (!savedCode || savedCode !== code) {
      return res.status(400).json({ code: 400, message: '验证码错误或已过期' })
    }
    await delCache(`verify:${req.user.openid}:export`)

    const activity = await queryOne('SELECT * FROM activities WHERE id = ?', [activityId])
    if (!activity || activity.creator_openid !== req.user.openid) {
      return res.status(403).json({ code: 403, message: '无权限' })
    }

    let sql = `SELECT r.*, u.nickname FROM registrations r
               JOIN users u ON r.user_openid = u.openid
               WHERE r.activity_id = ? AND r.cancelled_at IS NULL`
    const params = [activityId]
    if (subActivityId) { sql += ' AND r.sub_activity_id = ?'; params.push(subActivityId) }

    const regs = await query(sql, params)
    const customFields = parseJsonArray(activity.custom_fields, [])

    // 构建 Excel 数据
    const headers = ['序号', '昵称', '报名时间', '签到时间', ...customFields.map(f => f.label)]
    const rows = regs.map((r, idx) => {
      const customData = parseJsonObject(r.custom_data, {})
      const decrypted = {}
      for (const [k, v] of Object.entries(customData)) {
        decrypted[k] = decrypt(v) || v
      }
      return [
        idx + 1,
        r.nickname,
        r.created_at,
        r.checkin_time || '未签到',
        ...customFields.map(f => decrypted[f.key] || ''),
      ]
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    XLSX.utils.book_append_sheet(wb, ws, '报名名单')
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // 实际应上传到 COS 并返回下载链接
    // 简化版：返回 base64
    const base64 = buf.toString('base64')
    logger.info(`Admin ${req.user.openid} exported registrations for activity ${activityId}`)
    res.json({ code: 0, data: { downloadUrl: `data:application/vnd.ms-excel;base64,${base64}`, filename: `${activity.name}_报名名单.xlsx` } })
  } catch (e) {
    next(e)
  }
}

exports.getAnalytics = async (req, res, next) => {
  try {
    const { activityId } = req.params
    const activity = await queryOne('SELECT * FROM activities WHERE id = ?', [activityId])
    if (!activity || activity.creator_openid !== req.user.openid) {
      return res.status(403).json({ code: 403, message: '无权限' })
    }

    const [totalRow] = await query(
      'SELECT COUNT(*) AS cnt FROM registrations WHERE activity_id = ? AND cancelled_at IS NULL', [activityId]
    )
    const [checkinRow] = await query(
      'SELECT COUNT(*) AS cnt FROM registrations WHERE activity_id = ? AND checkin_time IS NOT NULL', [activityId]
    )
    const [cancelRow] = await query(
      'SELECT COUNT(*) AS cnt FROM registrations WHERE activity_id = ? AND cancelled_at IS NOT NULL', [activityId]
    )

    // 报名趋势（近 7 天）
    const trend = await query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count
       FROM registrations WHERE activity_id = ? AND cancelled_at IS NULL
       GROUP BY DATE(created_at) ORDER BY date`,
      [activityId]
    )

    const total = totalRow.cnt
    const checkin = checkinRow.cnt
    const cancel = cancelRow.cnt

    res.json({
      code: 0,
      data: {
        totalRegistrations: total,
        checkinCount: checkin,
        cancelCount: cancel,
        checkinRate: total > 0 ? Math.round((checkin / total) * 100) : 0,
        trend,
        fieldStats: [],
      },
    })
  } catch (e) {
    next(e)
  }
}

exports.getReports = async (req, res, next) => {
  try {
    const reports = await query(
      `SELECT r.*, a.name AS activity_name FROM reports r
       JOIN activities a ON r.activity_id = a.id
       ORDER BY r.created_at DESC LIMIT 50`
    )
    res.json({ code: 0, data: reports })
  } catch (e) {
    next(e)
  }
}

exports.ignoreReport = async (req, res, next) => {
  try {
    const { id } = req.params
    const report = await queryOne('SELECT * FROM reports WHERE activity_id = ?', [id])
    if (report) {
      await query('UPDATE reports SET handled = 1, handler_openid = ? WHERE activity_id = ?', [req.user.openid, id])
      await query("UPDATE activities SET status='upcoming' WHERE id = ? AND status='frozen'", [id])
    }
    res.json({ code: 0, message: '已忽略' })
  } catch (e) {
    next(e)
  }
}

exports.getCheckins = async (req, res, next) => {
  try {
    const { activityId } = req.params
    const list = await query(
      `SELECT r.id, r.checkin_time, u.nickname AS name, u.avatar_url AS avatarUrl
       FROM registrations r
       JOIN users u ON r.user_openid = u.openid
       WHERE r.activity_id = ? AND r.checkin_time IS NOT NULL
       ORDER BY r.checkin_time DESC`,
      [activityId]
    )
    res.json({ code: 0, data: list })
  } catch (e) {
    next(e)
  }
}
