// utils/media.js - 小程序图片 URL 规范化与无效占位过滤
const { API_BASE_URL } = require('./config')

/** 开发环境历史上传的无效占位图，按无封面处理 */
const BROKEN_URL_RE = /placeholder\.com/i

function apiOrigin() {
  return String(API_BASE_URL || '').replace(/\/api\/?$/i, '')
}

/**
 * 将后端/COS/相对路径转为 <image> 可用的完整 URL
 * @param {string} url
 * @returns {string} 空串表示无有效远程图（由组件 CSS 占位）
 */
function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return ''
  const u = url.trim()
  if (!u || BROKEN_URL_RE.test(u)) return ''
  if (/^wxfile:\/\//i.test(u) || /^cloud:\/\//i.test(u)) return u
  if (/^https?:\/\//i.test(u)) return u
  if (u.startsWith('//')) return `https:${u}`
  const origin = apiOrigin()
  if (!origin) return u
  if (u.startsWith('/')) return `${origin}${u}`
  return `${origin}/${u}`
}

function withActivityMedia(activity) {
  if (!activity || typeof activity !== 'object') return activity
  const coverImage = resolveMediaUrl(activity.coverImage)
  const creatorAvatar = resolveMediaUrl(activity.creatorAvatar)
  const patch = {}
  if (coverImage !== activity.coverImage) patch.coverImage = coverImage
  if (creatorAvatar !== activity.creatorAvatar) patch.creatorAvatar = creatorAvatar
  if (!Object.keys(patch).length) return activity
  return { ...activity, ...patch }
}

function resolveAvatarUrl(url) {
  return resolveMediaUrl(url)
}

module.exports = {
  resolveMediaUrl,
  resolveAvatarUrl,
  withActivityMedia,
}
