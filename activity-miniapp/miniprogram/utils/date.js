// utils/date.js - 日期工具
const i18n = require('./i18n')

function formatDate(dateStr, format = 'YYYY-MM-DD HH:mm') {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr

  const map = {
    'YYYY': d.getFullYear(),
    'MM': String(d.getMonth() + 1).padStart(2, '0'),
    'DD': String(d.getDate()).padStart(2, '0'),
    'HH': String(d.getHours()).padStart(2, '0'),
    'mm': String(d.getMinutes()).padStart(2, '0'),
    'ss': String(d.getSeconds()).padStart(2, '0'),
  }
  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, m => map[m])
}

/** @param {'zh'|'en'} [lang] 不传则跟随 i18n 当前语言 */
function formatRelative(dateStr, lang) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  const abs = Math.abs(diff)
  const lg = lang || i18n.getLanguage()

  if (lg === 'en') {
    if (abs < 60000) return i18n.t('timeJustNow')
    if (abs < 3600000) {
      const n = Math.floor(abs / 60000)
      return diff > 0 ? `${n} ${n === 1 ? 'minute' : 'minutes'} ago` : `${n} ${n === 1 ? 'minute' : 'minutes'} from now`
    }
    if (abs < 86400000) {
      const n = Math.floor(abs / 3600000)
      return diff > 0 ? `${n} ${n === 1 ? 'hour' : 'hours'} ago` : `${n} ${n === 1 ? 'hour' : 'hours'} from now`
    }
    if (abs < 2592000000) {
      const n = Math.floor(abs / 86400000)
      return diff > 0 ? `${n} ${n === 1 ? 'day' : 'days'} ago` : `${n} ${n === 1 ? 'day' : 'days'} from now`
    }
    return formatDate(dateStr, 'MM-DD HH:mm')
  }

  if (abs < 60000) return i18n.t('timeJustNow')
  if (abs < 3600000)
    return `${Math.floor(abs / 60000)}${i18n.t('timeMinutes')}${diff > 0 ? i18n.t('timeBefore') : i18n.t('timeAfter')}`
  if (abs < 86400000)
    return `${Math.floor(abs / 3600000)}${i18n.t('timeHours')}${diff > 0 ? i18n.t('timeBefore') : i18n.t('timeAfter')}`
  if (abs < 2592000000)
    return `${Math.floor(abs / 86400000)}${i18n.t('timeDays')}${diff > 0 ? i18n.t('timeBefore') : i18n.t('timeAfter')}`
  return formatDate(dateStr, 'MM-DD HH:mm')
}

function isPast(dateStr) {
  return new Date(dateStr) < new Date()
}

function isFuture(dateStr) {
  return new Date(dateStr) > new Date()
}

function getDurationText(startStr, endStr) {
  const start = new Date(startStr)
  const end = new Date(endStr)
  const diff = end - start
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days}天`
  if (hours > 0) return `${hours}小时`
  return `${Math.floor(diff / 60000)}分钟`
}

// 检测两个时间段是否冲突
function hasTimeConflict(start1, end1, start2, end2) {
  const s1 = new Date(start1).getTime()
  const e1 = new Date(end1).getTime()
  const s2 = new Date(start2).getTime()
  const e2 = new Date(end2).getTime()
  return s1 < e2 && e1 > s2
}

// 将 Date 对象转为 picker 可用的 value 字符串
function toPickerValue(date) {
  return formatDate(date instanceof Date ? date.toISOString() : date, 'YYYY-MM-DD')
}

function toPickerTimeValue(date) {
  return formatDate(date instanceof Date ? date.toISOString() : date, 'HH:mm')
}

function getDurationNatural(startStr, endStr) {
  const start = new Date(startStr)
  const end = new Date(endStr)
  const ms = end - start
  if (!(ms >= 0) || Number.isNaN(ms)) return ''
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  if (days >= 1) return `约 ${days} 天`
  if (hours >= 1) return `约 ${hours} 小时`
  if (minutes >= 1) return `约 ${minutes} 分钟`
  return '不足 1 分钟'
}

// 获取活动状态
function getActivityStatus(activity) {
  const now = new Date()
  const start = new Date(activity.startTime)
  const end = new Date(activity.endTime)

  if (activity.status === 'cancelled') return 'cancelled'
  if (activity.status === 'offline') return 'offline'
  if (now < start) return 'upcoming'
  if (now > end) return 'ended'
  if (activity.maxParticipants > 0 && activity.registrationCount >= activity.maxParticipants) return 'full'
  return 'active'
}

module.exports = {
  formatDate,
  formatRelative,
  isPast,
  isFuture,
  getDurationText,
  getDurationNatural,
  hasTimeConflict,
  toPickerValue,
  toPickerTimeValue,
  getActivityStatus,
}
