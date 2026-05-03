// 活动现场签到 token（按活动 + 小时轮换，与二维码刷新一致）
const crypto = require('crypto')

function genCheckinTokenForHour(activityId, hour) {
  return crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(`${activityId}:${hour}`)
    .digest('hex')
    .slice(0, 16)
}

function genCheckinToken(activityId) {
  const hour = Math.floor(Date.now() / 3600000)
  return genCheckinTokenForHour(activityId, hour)
}

function isValidCheckinToken(activityId, token) {
  if (!token || !activityId) return false
  const hour = Math.floor(Date.now() / 3600000)
  const expected = genCheckinTokenForHour(activityId, hour)
  const prev = genCheckinTokenForHour(activityId, hour - 1)
  return token === expected || token === prev
}

module.exports = { genCheckinToken, genCheckinTokenForHour, isValidCheckinToken }
