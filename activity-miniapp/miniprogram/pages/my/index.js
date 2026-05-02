// pages/my/index.js
const request = require('../../utils/request')
const { formatDate, getActivityStatus } = require('../../utils/date')
const i18n = require('../../utils/i18n')

const STATUS_MAP = {
  active: { text: '进行中', cls: 'status-mini-active' },
  upcoming: { text: '未开始', cls: 'status-mini-upcoming' },
  ended: { text: '已结束', cls: 'status-mini-ended' },
  full: { text: '已报满', cls: 'status-mini-full' },
  cancelled: { text: '已取消', cls: 'status-mini-ended' },
  offline: { text: '已下架', cls: 'status-mini-ended' },
}

Page({
  data: {
    userInfo: {},
    isAdmin: false,
    activeTab: 'created',
    activities: [],
    loading: false,
    myActivitiesCount: 0,
    myRegistrationsCount: 0,
    checkinCount: 0,
    langText: 'English',
  },

  onLoad() {
    this._loadUserInfo()
  },

  onShow() {
    this._loadActivities()
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

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab, activities: [] })
    this._loadActivities()
  },

  async _loadActivities() {
    this.setData({ loading: true })
    try {
      const [createdRes, registeredRes] = await Promise.all([
        request.get('/activities/my-created'),
        request.get('/registrations/my'),
      ])
      const created = (createdRes.data || []).map(a => ({
        ...a,
        startTimeText: formatDate(a.startTime, 'MM月DD日 HH:mm'),
        statusText: STATUS_MAP[getActivityStatus(a)]?.text || '',
        statusClass: STATUS_MAP[getActivityStatus(a)]?.cls || '',
      }))
      const registered = (registeredRes.data || []).map(r => ({
        ...r,
        startTimeText: formatDate(r.startTime, 'MM月DD日 HH:mm'),
        statusText: STATUS_MAP[getActivityStatus(r)]?.text || '',
        statusClass: STATUS_MAP[getActivityStatus(r)]?.cls || '',
      }))

      this.setData({
        activities: this.data.activeTab === 'created' ? created : registered,
        myActivitiesCount: created.length,
        myRegistrationsCount: registered.length,
        checkinCount: registered.filter(r => r.checkinTime).length,
        loading: false,
      })
    } catch (e) {
      this.setData({ loading: false })
    }
  },

  onActivityTap(e) {
    wx.navigateTo({ url: `/pages/activity-detail/index?id=${e.currentTarget.dataset.id}` })
  },

  goCreate() {
    wx.navigateTo({ url: '/pages/create-activity/index' })
  },

  goDiscover() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  goAdmin() {
    wx.navigateTo({ url: '/pages/admin/index' })
  },

  goDataPrivacy() {
    wx.showModal({
      title: '数据下载与删除',
      content: '您可以下载您的所有个人数据，或申请永久删除账号及所有数据。删除操作不可逆，请谨慎操作。',
      confirmText: '申请删除',
      cancelText: '下载数据',
      success: async (res) => {
        if (res.confirm) {
          wx.showModal({
            title: '确认删除',
            content: '删除后您的所有数据将永久清除，且无法恢复，确认删除？',
            confirmText: '确认删除',
            confirmColor: '#EF4444',
            success: async (r) => {
              if (r.confirm) {
                try {
                  await request.delete('/auth/account')
                  wx.showToast({ title: '删除申请已提交', icon: 'success' })
                  this.onLogout()
                } catch (e) {}
              }
            },
          })
        } else {
          try {
            const res = await request.post('/auth/export-data')
            wx.setClipboardData({ data: res.data.downloadUrl })
            wx.showToast({ title: '下载链接已复制', icon: 'success' })
          } catch (e) {}
        }
      },
    })
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
