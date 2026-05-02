// utils/config.js
const ENV = 'development' // 'production' | 'development'

const CONFIG = {
  development: {
    API_BASE_URL: 'http://localhost:3000/api',
    WS_URL: 'ws://localhost:3000',
  },
  production: {
    API_BASE_URL: 'https://your-domain.com/api',
    WS_URL: 'wss://your-domain.com',
  },
}

module.exports = {
  ...CONFIG[ENV],
  ENV,
  MAP_KEY: 'YOUR_TENCENT_MAP_KEY',
  AI_POSTER_API: 'https://your-ai-poster-api.com',
  APP_ID: 'YOUR_WECHAT_APP_ID',
}
