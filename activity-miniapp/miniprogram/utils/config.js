// utils/config.js
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️  所有需要填写的 ID/Key 都在这里
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 【1】开发 / 生产环境切换
//   开发阶段保持 'development'，部署上线前改为 'production'
const ENV = 'development'

// 【2】微信小程序 AppID（在微信公众平台 → 开发管理 → 开发设置 中查看）
const APP_ID = 'YOUR_WECHAT_APP_ID'

// 【3】后端接口地址
//   development：电脑本机（手机真机调试时改为局域网 IP，如 http://192.168.1.100:3000/api）
//   production ：你的服务器域名（必须 HTTPS）
const API_BASE_URL = {
  development: 'http://localhost:3000/api',
  production:  'https://your-domain.com/api',
}

// 【4】腾讯地图 SDK Key
//   申请地址：https://lbs.qq.com/dev/console/application/mine
//   创建应用后选"微信小程序"并绑定上方 APP_ID
const MAP_KEY = 'YOUR_TENCENT_MAP_KEY'

// 【5】订阅消息模板 ID（在微信公众平台 → 功能 → 订阅消息 中查看）
const SUBSCRIBE_TEMPLATES = {
  // 活动开始提醒（用户报名后请求授权）
  REMIND_24H: 'YOUR_TEMPLATE_ID_REMIND_24H',
  REMIND_1H:  'YOUR_TEMPLATE_ID_REMIND_1H',
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 以下无需修改
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
module.exports = {
  ENV,
  APP_ID,
  MAP_KEY,
  SUBSCRIBE_TEMPLATES,
  API_BASE_URL: API_BASE_URL[ENV],
}
