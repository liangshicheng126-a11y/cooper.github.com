// utils/map.js - 腾讯地图工具
const { MAP_KEY } = require('./config')

// 调起微信选择地点
function chooseLocation() {
  return new Promise((resolve, reject) => {
    wx.chooseLocation({
      success: (res) => {
        resolve({
          name: res.name,
          address: res.address,
          latitude: res.latitude,
          longitude: res.longitude,
        })
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.includes('cancel')) {
          reject({ cancelled: true })
        } else {
          reject(err)
        }
      },
    })
  })
}

// 打开导航
function openNavigation(latitude, longitude, name) {
  wx.openLocation({
    latitude,
    longitude,
    name,
    scale: 16,
    fail: () => {
      wx.showToast({ title: '打开地图失败', icon: 'none' })
    },
  })
}

// 逆地理编码（坐标转地址）
function reverseGeocode(latitude, longitude) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${MAP_KEY}&get_poi=0`,
      success: (res) => {
        if (res.data?.status === 0) {
          resolve(res.data.result)
        } else {
          reject(new Error('逆地理编码失败'))
        }
      },
      fail: reject,
    })
  })
}

module.exports = {
  chooseLocation,
  openNavigation,
  reverseGeocode,
}
