// pages/my/index.js
const request = require('../../utils/request')

Page({
  data: {
    userInfo: {},
    isAdmin: false,
    myActivitiesCount: 0,
    myRegistrationsCount: 0,
    langText: 'English',
  },

  onLoad() {
    this._loadUserInfo()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(1)
    }
    this._loadUserInfo()
    this._refreshStats()
  },

  _loadUserInfo() {
    const app = getApp()
    const { userInfo, isAdmin, language } = app.globalData
    this.setData({
      userInfo: userInfo || {},
      isAdmin: isAdmin || false,
      langText: language === 'zh' ? 'English' : '中文',
    })
  },

  async _refreshStats() {
    const app = getApp()
    if (!app.globalData.token) {
      this.setData({ myActivitiesCount: 0, myRegistrationsCount: 0 })
      return
    }
    try {
      const [createdRes, registeredRes] = await Promise.all([
        request.get('/activities/my-created'),
        request.get('/registrations/my'),
      ])
      this.setData({
        myActivitiesCount: (createdRes.data || []).length,
        myRegistrationsCount: (registeredRes.data || []).length,
      })
    } catch (e) {
      this.setData({ myActivitiesCount: 0, myRegistrationsCount: 0 })
    }
  },

  goPublishedList() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/my-published/index' })
  },

  goRegisteredList() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/my-registered/index' })
  },

  goAdmin() {
    wx.navigateTo({ url: '/pages/admin/index' })
  },

  toggleLanguage() {
    const app = getApp()
    const newLang = app.globalData.language === 'zh' ? 'en' : 'zh'
    app.setLanguage(newLang)
    this.setData({ langText: newLang === 'zh' ? 'English' : '中文' })
    wx.showToast({ title: newLang === 'zh' ? '已切换为中文' : 'Switched to English', icon: 'none' })
  },

  openPrivacyPolicy() {
    wx.navigateTo({ url: '/pages/privacy/index' })
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token')
          const app = getApp()
          app.globalData.token = null
          app.globalData.userInfo = null
          wx.reLaunch({ url: '/pages/index/index' })
        }
      },
    })
  },
})
