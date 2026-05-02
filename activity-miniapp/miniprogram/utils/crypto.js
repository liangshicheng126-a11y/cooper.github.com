// utils/crypto.js - 前端数据脱敏工具（密钥加密在后端，前端只做展示脱敏）
function maskPhone(phone) {
  if (!phone || phone.length < 7) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

function maskIdCard(idCard) {
  if (!idCard || idCard.length < 10) return idCard
  return idCard.replace(/(\d{4})\d+(\d{4})/, '$1**********$2')
}

function maskEmail(email) {
  if (!email) return email
  const [user, domain] = email.split('@')
  if (!domain) return email
  const masked = user.length > 2 ? user[0] + '***' + user.slice(-1) : user[0] + '***'
  return `${masked}@${domain}`
}

function maskName(name) {
  if (!name || name.length < 2) return name
  return name[0] + '*'.repeat(name.length - 1)
}

// 生成随机颜色（用于头像背景等）
function randomColor(seed) {
  const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6']
  const idx = seed ? seed.charCodeAt(0) % colors.length : Math.floor(Math.random() * colors.length)
  return colors[idx]
}

module.exports = {
  maskPhone,
  maskIdCard,
  maskEmail,
  maskName,
  randomColor,
}
