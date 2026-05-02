// utils/config.js
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 公共配置；敏感 Key 请写到同目录 config.local.js（见 config.local.example.js）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let local = {}
try {
  local = require('./config.local.js')
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND' && !/Cannot find module/i.test(e.message || '')) throw e
}

/** 非空字符串才覆盖默认值 */
function pickStr(override, fallback) {
  if (typeof override !== 'string') return fallback
  const t = override.trim()
  return t !== '' ? t : fallback
}

// 【1】开发 / 生产环境切换
const ENV = 'development'

// 【2】微信小程序 AppID（在微信公众平台 → 开发管理 → 开发设置 中查看）
const APP_ID = 'wxa909312a016c6847'

// 【3】后端接口地址
const API_BASE_URL_MAP = {
  development: 'http://localhost:3000/api',
  production:  'https://your-domain.com/api',
}

// 【4】【4-b】密钥默认占位；填写 config.local.js 后自动生效
const MAP_KEY = pickStr(local.MAP_KEY, 'YOUR_TENCENT_MAP_KEY')
const GOOGLE_MAPS_KEY = pickStr(local.GOOGLE_MAPS_KEY, 'YOUR_GOOGLE_MAPS_KEY')

// 【5】订阅消息模板 ID
const SUBSCRIBE_TEMPLATES = {
  REMIND_24H: 'YOUR_TEMPLATE_ID_REMIND_24H',
  REMIND_1H:  'YOUR_TEMPLATE_ID_REMIND_1H',
}

const API_BASE_URL = pickStr(local.API_BASE_URL, API_BASE_URL_MAP[ENV])

module.exports = {
  ENV,
  APP_ID,
  MAP_KEY,
  GOOGLE_MAPS_KEY,
  SUBSCRIBE_TEMPLATES,
  API_BASE_URL,
}
