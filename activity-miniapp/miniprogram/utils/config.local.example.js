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
 * 3. Google Geocoding GOOGLE_MAPS_KEY（海外 tab，仅正向/逆向地址解析调用 Google）
 *    Google Cloud：https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
 *    启用「Geocoding API」，创建浏览器/通用限制Key（建议再加 IP 或服务端代理则更安全；
 *    小程序直调时需把 Key 的「应用程序限制」放宽或按文档配置）
 *
 * 4. 微信小程序后台 → 开发管理 → 服务器域名 → request合法域名：
 *    - https://maps.googleapis.com
 *    - https://apis.map.qq.com
 *
 * 5. （可选）本机局域网真机调试时，可改写下方 API_BASE_URL 为电脑的局域网 IP。
 */

module.exports = {
  // 必填其一：中国区「定位」无 Key 时会降级用 OpenStreetM（准确度一般）
  MAP_KEY: '',

  // 海外专用；留空则海外仍用 OpenStreetMap
  GOOGLE_MAPS_KEY: '',

  // 可选覆盖（不填则用 config.js 里按 ENV 选的地址）
  // API_BASE_URL: 'http://192.168.1.100:3000/api',
}
