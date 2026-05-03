// app.js
const request = require('./utils/request')
const i18n = require('./utils/i18n')

App({
  globalData: {
    userInfo: null,
    openid: null,
    token: null,
    isAdmin: false,
    language: 'zh',
    privacyAgreed: false,
    /** 发布新活动后为 true：回到发现页时切到「全部」并强制拉列表 */
    refreshHomeActivityListNextShow: false,
  },

  onLaunch() {
    this._checkPrivacyAgreement()
    this._initLanguage()
    wx.onThemeChange(({ theme }) => {
      this.globalData.theme = theme
    })
  },

  _checkPrivacyAgreement() {
    const agreed = wx.getStorageSync('privacyAgreed')
    if (agreed) {
      this.globalData.privacyAgreed = true
      this._autoLogin()
    }
  },

  _initLanguage() {
    const lang = wx.getStorageSync('language') || 'zh'
    this.globalData.language = lang
    i18n.setLanguage(lang)
  },

  async _autoLogin() {
    try {
      const token = wx.getStorageSync('token')
      if (token) {
        this.globalData.token = token
        const res = await request.get('/auth/profile')
        this.globalData.userInfo = res.data
        this.globalData.openid = res.data.openid || null
        this.globalData.isAdmin = res.data.isAdmin || false
      } else {
        await this.wxLogin()
      }
    } catch (e) {
      wx.removeStorageSync('token')
      await this.wxLogin()
    }
  },

  async wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: async (res) => {
          try {
            const result = await request.post('/auth/login', { code: res.code })
            this.globalData.token = result.data.token
            this.globalData.userInfo = result.data.user
            this.globalData.openid = result.data.openid
            this.globalData.isAdmin = result.data.user.isAdmin || false
            wx.setStorageSync('token', result.data.token)
            resolve(result.data)
          } catch (e) {
            reject(e)
          }
        },
        fail: reject,
      })
    })
  },

  setLanguage(lang) {
    this.globalData.language = lang
    i18n.setLanguage(lang)
    wx.setStorageSync('language', lang)
  },
})
