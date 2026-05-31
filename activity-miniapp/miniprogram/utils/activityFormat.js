// utils/activityFormat.js - 列表/横幅等活动展示用时间格式（跟随 i18n）
const { formatDate } = require('./date')
const i18n = require('./i18n')
const { withActivityMedia } = require('./media')

/** 卡片列表行右侧时间一行 */
function listRowStartTime(startTime) {
  if (!startTime) return ''
  const zh = i18n.getLanguage() === 'zh'
  return formatDate(startTime, zh ? 'MM月DD日 HH:mm' : 'MM-DD HH:mm')
}

/** 首页横幅简短日期 */
function bannerRowStartTime(startTime) {
  if (!startTime) return ''
  const zh = i18n.getLanguage() === 'zh'
  return formatDate(startTime, zh ? 'MM月DD日' : 'MM-DD')
}

function withListRowTimes(activity) {
  return withActivityMedia({
    ...activity,
    startTimeText: listRowStartTime(activity.startTime),
  })
}

module.exports = {
  listRowStartTime,
  bannerRowStartTime,
  withListRowTimes,
}
