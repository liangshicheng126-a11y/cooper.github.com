/**
 * 【配置地图与接口密钥】
 *
 * 1. 在本目录复制一份本文件，重命名为 config.local.js
 *    （config.local.js 已在仓库 .gitignore 中，不要提交到 Git）
 *
 * 2. 腾讯地图 MAP_KEY（中国 tab「定位」、国内地图微调逆地理）
 *    https://lbs.qq.com/dev/console/application/mine
 *    新建「WebServiceAPI」密钥，勾选「微信小程序」并绑定小程序 AppID
 *
 * 3. Google GOOGLE_MAPS_KEY（海外：Geocoding 解析地址 + Static 显示 Google 图示）
 *    - Geocoding API：https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
 *    - Maps Static API（海外确认页图示，必须与 Geocoding 用同一密钥或均允许该 Key）：
 *      https://console.cloud.google.com/apis/library/static-maps-backend.googleapis.com
 *
 * 4. 微信公众平台 → 服务器域名：
 *    - request 合法域名：https://maps.googleapis.com 、 https://apis.map.qq.com
 *    - downloadFile 合法域名（<image 加载静态地图图必填）：https://maps.googleapis.com
 *
 * 5. （可选）本机局域网真机调试时，可改写下方 API_BASE_URL 为电脑的局域网 IP。
 */

module.exports = {
  // 上传微信审核 / 正式版请设为 production（API 默认 https://api.cooperliang.top/api）
  // ENV: 'production',

  // 可选：覆盖生产 API（一般不必改）
  // API_BASE_URL: 'https://api.cooperliang.top/api',

  // 必填其一：中国区「定位」无 Key 时会降级用 OpenStreetM（准确度一般）
  MAP_KEY: '',

  // 海外专用；留空则海外仍用 OpenStreetMap
  GOOGLE_MAPS_KEY: '',

  // 可选覆盖（不填则用 config.js 里按 ENV 选的地址）
  // API_BASE_URL: 'http://192.168.1.100:3000/api',

  // 生产订阅消息模板 ID
  // SUBSCRIBE_TEMPLATES: {
  //   REMIND_24H: '',
  //   REMIND_1H: '',
  // },
}
