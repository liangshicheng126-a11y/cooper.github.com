// utils/config.js
// ⚠️ 开发时将 ENV 设为 'development'，上线前改为 'production'
const ENV = 'development'

const CONFIG = {
  development: {
    // 开发阶段：电脑本机地址（手机真机调试时改为局域网 IP，如 http://192.168.1.100:3000/api）
    API_BASE_URL: 'http://localhost:3000/api',
  },
  production: {
    // 上线后填入你的服务器域名（必须 HTTPS）
    API_BASE_URL: 'https://your-domain.com/api',
  },
}

module.exports = {
  ...CONFIG[ENV],
  ENV,
  // 腾讯地图 SDK Key（第 6.4 步获取）
  MAP_KEY: 'YOUR_TENCENT_MAP_KEY',
  // 微信小程序 AppID（第 2 步获取）
  APP_ID: 'YOUR_WECHAT_APP_ID',
}
