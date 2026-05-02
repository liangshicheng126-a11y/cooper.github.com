// utils/request.js - HTTP 请求封装
const { API_BASE_URL } = require('./config')

const MAX_RETRY = 2

function getToken() {
  return wx.getStorageSync('token') || ''
}

function showNetworkError() {
  wx.showToast({ title: '网络异常，请重试', icon: 'none' })
}

async function request(method, url, data = {}, retry = 0) {
  const token = getToken()
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`

  return new Promise((resolve, reject) => {
    wx.request({
      url: fullUrl,
      method,
      data,
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
      header: { 'Authorization': token ? `Bearer ${token}` : '' },
      success: (res) => {
        try {
          const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          resolve(data)
        } catch (e) {
          resolve(res.data)
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
  delete: (url, data) => request('DELETE', url, data),
  upload,
}
