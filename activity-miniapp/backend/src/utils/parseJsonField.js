/**
 * 兼容数据库存储为 TEXT（字符串）或 MySQL JSON 类型（mysql2 可能已解析为 object）。
 * 对已对象调用 JSON.parse 会先转成 "[object Object]" 再解析失败。
 */
function parseJsonField(value, fallback) {
  if (value == null || value === '') return fallback
  if (typeof value === 'object') return value
  if (typeof value !== 'string') return fallback
  try {
    return JSON.parse(value)
  } catch (e) {
    return fallback
  }
}

function parseJsonArray(value, fallback = []) {
  const v = parseJsonField(value, fallback)
  return Array.isArray(v) ? v : fallback
}

function parseJsonObject(value, fallback = {}) {
  const v = parseJsonField(value, fallback)
  if (v && typeof v === 'object' && !Array.isArray(v)) return v
  return fallback
}

module.exports = { parseJsonField, parseJsonArray, parseJsonObject }
