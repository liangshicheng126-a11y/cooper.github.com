// src/jobs/reminderJob.js - 定时提醒任务
const cron = require('node-cron')
const { query } = require('../config/db')
const wxService = require('../services/wxService')
const logger = require('../utils/logger')

// 每 10 分钟检查一次需要提醒的活动
cron.schedule('*/10 * * * *', async () => {
  try {
    const now = new Date()
    const in24h = new Date(now.getTime() + 24 * 3600 * 1000)
    const in1h = new Date(now.getTime() + 3600 * 1000)
    const in10m = new Date(now.getTime() + 10 * 60 * 1000)

    // 24 小时提醒
    const activities24h = await query(
      `SELECT a.id, a.name, a.start_time FROM activities a
       WHERE a.start_time BETWEEN ? AND ?
       AND a.status != 'offline' AND a.reminded_24h = 0`,
      [now.toISOString(), in24h.toISOString()]
    )

    for (const activity of activities24h) {
      await _sendReminder(activity, '24小时')
      await query('UPDATE activities SET reminded_24h = 1 WHERE id = ?', [activity.id])
    }

    // 1 小时提醒
    const activities1h = await query(
      `SELECT a.id, a.name, a.start_time FROM activities a
       WHERE a.start_time BETWEEN ? AND ?
       AND a.status != 'offline' AND a.reminded_1h = 0`,
      [now.toISOString(), in1h.toISOString()]
    )

    for (const activity of activities1h) {
      await _sendReminder(activity, '1小时')
      await query('UPDATE activities SET reminded_1h = 1 WHERE id = ?', [activity.id])
    }
  } catch (e) {
    logger.error('Reminder job error:', e.message)
  }
})

async function _sendReminder(activity, timeLabel) {
  const registrants = await query(
    'SELECT user_openid FROM registrations WHERE activity_id = ? AND cancelled_at IS NULL',
    [activity.id]
  )
  logger.info(`Sending ${timeLabel} reminder for activity ${activity.id} to ${registrants.length} users`)
  for (const r of registrants) {
    await wxService.sendSubscribeMessage(
      r.user_openid,
      process.env.WX_TMPL_REMINDER || 'YOUR_REMIND_TEMPLATE',
      {
        thing1: { value: activity.name.slice(0, 20) },
        time2: { value: new Date(activity.start_time).toLocaleString('zh-CN') },
        thing3: { value: `活动将在 ${timeLabel} 后开始，请做好准备！` },
      },
      `pages/activity-detail/index?id=${activity.id}`
    )
  }
}
