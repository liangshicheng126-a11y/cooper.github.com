// src/utils/crypto.js - AES-256 加密/解密（使用 KMS 或本地密钥）
const crypto = require('crypto')
const logger = require('./logger')

const ALGORITHM = 'aes-256-gcm'

function getKey() {
  const key = process.env.AES_KEY
  if (!key || key.length < 32) throw new Error('AES_KEY 配置错误')
  return Buffer.from(key.slice(0, 32), 'utf8')
}

function encrypt(plainText) {
  if (!plainText) return null
  const iv = crypto.randomBytes(12)
  const key = getKey()
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // 格式: iv(12) + tag(16) + ciphertext，Base64 编码
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

function decrypt(encryptedBase64) {
  if (!encryptedBase64) return null
  try {
    const buf = Buffer.from(encryptedBase64, 'base64')
    const iv = buf.slice(0, 12)
    const tag = buf.slice(12, 28)
    const ciphertext = buf.slice(28)
    const key = getKey()
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)
    return decipher.update(ciphertext) + decipher.final('utf8')
  } catch (e) {
    logger.error('Decrypt failed:', e.message)
    return null
  }
}

// 脱敏显示
function maskPhone(phone) {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

function maskIdCard(id) {
  if (!id) return ''
  return id.replace(/(\d{4})\d+(\d{4})/, '$1**********$2')
}

function maskEmail(email) {
  if (!email) return ''
  const [user, domain] = email.split('@')
  if (!domain) return email
  const m = user.length > 2 ? `${user[0]}***${user.slice(-1)}` : `${user[0]}***`
  return `${m}@${domain}`
}

function maskName(name) {
  if (!name) return ''
  return name.length > 1 ? name[0] + '*'.repeat(name.length - 1) : name
}

// 生成随机 6 位数字验证码
function genVerifyCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

module.exports = { encrypt, decrypt, maskPhone, maskIdCard, maskEmail, maskName, genVerifyCode }
