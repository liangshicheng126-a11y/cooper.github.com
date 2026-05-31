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

// 【1】开发 / 生产环境切换；可在 config.local.js 覆盖为 production
const ENV = pickStr(local.ENV, 'development')

// 【2】微信小程序 AppID（在微信公众平台 → 开发管理 → 开发设置 中查看）
const APP_ID = 'wxa909312a016c6847'

// 【3】后端接口地址
// 模拟器请用 127.0.0.1（localhost 在部分环境下无法请求）；真机预览请在 config.local.js 改为电脑局域网 IP
const API_BASE_URL_MAP = {
  development: 'http://127.0.0.1:3000/api',
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
const SUBSCRIBE_TEMPLATE_OVERRIDES = local.SUBSCRIBE_TEMPLATES || {}

Object.keys(SUBSCRIBE_TEMPLATE_OVERRIDES).forEach((key) => {
  if (typeof SUBSCRIBE_TEMPLATE_OVERRIDES[key] === 'string' && SUBSCRIBE_TEMPLATE_OVERRIDES[key].trim()) {
    SUBSCRIBE_TEMPLATES[key] = SUBSCRIBE_TEMPLATE_OVERRIDES[key].trim()
  }
})

function assertNoProductionPlaceholders() {
  if (ENV !== 'production') return
  const placeholders = [
    ['API_BASE_URL', API_BASE_URL],
    ['MAP_KEY', MAP_KEY],
    ['SUBSCRIBE_TEMPLATES.REMIND_24H', SUBSCRIBE_TEMPLATES.REMIND_24H],
    ['SUBSCRIBE_TEMPLATES.REMIND_1H', SUBSCRIBE_TEMPLATES.REMIND_1H],
  ].filter(([, value]) => /YOUR_|your-domain/i.test(String(value || '')))

  if (placeholders.length) {
    throw new Error(`生产配置仍包含占位符：${placeholders.map(([key]) => key).join(', ')}`)
  }
}

assertNoProductionPlaceholders()

module.exports = {
  ENV,
  APP_ID,
  MAP_KEY,
  GOOGLE_MAPS_KEY,
  SUBSCRIBE_TEMPLATES,
  API_BASE_URL,
}
