// utils/request.js - HTTP 请求封装
const { API_BASE_URL } = require('./config')

const MAX_RETRY = 2
/** wx.request / uploadFile 超时（毫秒），避免弱网无限挂起 */
const HTTP_TIMEOUT_MS = 30000

function getToken() {
  return wx.getStorageSync('token') || ''
}

function showNetworkError() {
  wx.showToast({ title: '网络异常，请重试', icon: 'none' })
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
          resolve(res.data)
        } else {
          const msg = res.data?.message || `请求失败 (${res.statusCode})`
          wx.showToast({ title: msg, icon: 'none', duration: 2500 })
          reject(new Error(msg))
        }
      },
      fail: (err) => {
        showNetworkError()
        reject(err)
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
      fail: reject,
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
}
