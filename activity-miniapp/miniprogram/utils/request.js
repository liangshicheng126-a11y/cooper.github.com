// utils/request.js - HTTP 请求封装
const { API_BASE_URL } = require('./config')

const MAX_RETRY = 2
/** wx.request / uploadFile 超时（毫秒），避免弱网无限挂起 */
const HTTP_TIMEOUT_MS = 30000
const NETWORK_TOAST_GAP_MS = 2500
let lastNetworkToastAt = 0

function getToken() {
  return wx.getStorageSync('token') || ''
}

function isNetworkFail(err) {
  const msg = String(err?.errMsg || err?.message || err || '').toLowerCase()
  return /request:fail|uploadfile:fail|econnrefused|timeout|err_connection|network|failed to connect/.test(msg)
}

function createNetworkError(err, fullUrl) {
  const raw = err?.errMsg || err?.message || 'request:fail'
  const message = /econnrefused|failed to connect/i.test(raw)
    ? '后端服务未连接，请先启动本地服务'
    : /timeout/i.test(raw)
      ? '请求超时，请检查网络或后端服务'
      : '网络异常，请重试'
  const e = new Error(message)
  e.isNetworkError = true
  e.apiBaseUrl = API_BASE_URL
  e.url = fullUrl
  e.errMsg = raw
  e.original = err
  return e
}

function showNetworkError(error) {
  const now = Date.now()
  if (now - lastNetworkToastAt < NETWORK_TOAST_GAP_MS) return
  lastNetworkToastAt = now
  wx.showToast({ title: error?.message || '网络异常，请重试', icon: 'none', duration: 2500 })
}

/** GET 查询串不传 undefined/null/空串，避免被序列化为 category=undefined 导致服务端按分类过滤为空 */
function cleanGetQuery(payload) {
  if (!payload || typeof payload !== 'object') return {}
  const out = {}
  Object.keys(payload).forEach((k) => {
    const v = payload[k]
    if (v === undefined || v === null) return
    if (typeof v === 'string' && v.trim() === '') return
    out[k] = v
  })
  return out
}

async function request(method, url, data = {}, retry = 0) {
  const token = getToken()
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
  const payload = method === 'GET' ? cleanGetQuery(data) : data

  return new Promise((resolve, reject) => {
    wx.request({
      url: fullUrl,
      method,
      timeout: HTTP_TIMEOUT_MS,
      data: payload,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      success: async (res) => {
        if (res.statusCode === 401) {
          // Token 过期，尝试重新登录
          wx.removeStorageSync('token')
          const app = getApp()
          try {
            await app.wxLogin()
            if (retry < MAX_RETRY) {
              resolve(await request(method, url, data, retry + 1))
            } else {
              reject(new Error('认证失败'))
            }
          } catch (e) {
            reject(e)
          }
          return
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const body = res.data
          if (body && typeof body === 'object' && body.code !== undefined && body.code !== 0) {
            const msg = body.message || '请求失败'
            wx.showToast({ title: msg, icon: 'none', duration: 2500 })
            reject(new Error(msg))
            return
          }
          resolve(body)
        } else {
          const msg = res.data?.message || `请求失败 (${res.statusCode})`
          wx.showToast({ title: msg, icon: 'none', duration: 2500 })
          reject(new Error(msg))
        }
      },
      fail: (err) => {
        const error = isNetworkFail(err) ? createNetworkError(err, fullUrl) : err
        if (error.isNetworkError) showNetworkError(error)
        reject(error)
      },
    })
  })
}

// 上传文件
function upload(url, filePath, name = 'file', formData = {}) {
  const token = getToken()
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: fullUrl,
      filePath,
      name,
      formData,
      timeout: HTTP_TIMEOUT_MS,
      header: { 'Authorization': token ? `Bearer ${token}` : '' },
      success: (res) => {
        try {
          const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          if (data && typeof data === 'object' && data.code !== undefined && data.code !== 0) {
            const msg = data.message || '上传失败'
            wx.showToast({ title: msg, icon: 'none', duration: 2500 })
            reject(new Error(msg))
            return
          }
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data)
          } else {
            const msg = data?.message || `上传失败 (${res.statusCode})`
            wx.showToast({ title: msg, icon: 'none', duration: 2500 })
            reject(new Error(msg))
          }
        } catch (e) {
          reject(e)
        }
      },
      fail: (err) => {
        const error = isNetworkFail(err) ? createNetworkError(err, fullUrl) : err
        if (error.isNetworkError) showNetworkError(error)
        reject(error)
      },
    })
  })
}

module.exports = {
  get: (url, data) => request('GET', url, data),
  post: (url, data) => request('POST', url, data),
  put: (url, data) => request('PUT', url, data),
  patch: (url, data) => request('PATCH', url, data),
  delete: (url, data) => request('DELETE', url, data),
  upload,
  isNetworkFail,
}
