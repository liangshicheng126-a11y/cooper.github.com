// pages/my/index.js
const request = require('../../utils/request')
const i18n = require('../../utils/i18n')

Page({
  data: {
    userInfo: {},
    isAdmin: false,
    myActivitiesCount: 0,
    myRegistrationsCount: 0,
    langText: 'English',
    strPublished: '',
    strJoined: '',
    strStatsTip: '',
    strListArrow: '',
    strNotLogged: '',
    strAdminBadge: '',
    strLanguageMenu: '',
    strPrivacyMenu: '',
    strLogoutMenu: '',
    strAdminMenu: '',
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

  _applyMenuLocale() {
    this.setData({
      langText: i18n.t('switchLang'),
      strPublished: i18n.t('publishedStat'),
      strJoined: i18n.t('joinedStat'),
      strStatsTip: i18n.t('statsTipTap'),
      strListArrow: i18n.t('listOpen'),
      strNotLogged: i18n.t('notLoggedIn'),
      strAdminBadge: i18n.t('adminBadge'),
      strLanguageMenu: i18n.t('languageMenu'),
      strPrivacyMenu: i18n.t('privacyMenu'),
      strLogoutMenu: i18n.t('logoutMenu'),
      strAdminMenu: i18n.t('adminPanel'),
    })
  },

  _loadUserInfo() {
    const app = getApp()
    const { userInfo, isAdmin } = app.globalData
    this.setData({
      userInfo: userInfo || {},
      isAdmin: isAdmin || false,
    })
    this._applyMenuLocale()
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
      wx.showToast({ title: i18n.t('plsLogin'), icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/my-published/index' })
  },

  goRegisteredList() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.showToast({ title: i18n.t('plsLogin'), icon: 'none' })
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
    this._applyMenuLocale()
    const tabBar = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tabBar && typeof tabBar.applyLocale === 'function') {
      tabBar.applyLocale()
    }
    wx.showToast({
      title: i18n.t(newLang === 'zh' ? 'switchedZh' : 'switchedEn'),
      icon: 'none',
    })
  },

  openPrivacyPolicy() {
    wx.navigateTo({ url: '/packageLegal/pages/privacy/index' })
  },

  onLogout() {
    wx.showModal({
      title: i18n.t('logoutConfirmTitle'),
      content: i18n.t('logoutConfirmBody'),
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
