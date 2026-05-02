// pages/index/index.js
const request = require('../../utils/request')
const { formatDate, getActivityStatus } = require('../../utils/date')
const i18n = require('../../utils/i18n')

const PAGE_SIZE = 10

Page({
  data: {
    activities: [],
    bannerList: [],
    loading: false,
    loadingMore: false,
    refreshing: false,
    noMore: false,
    page: 1,
    activeCategory: 'all',
    listTitle: '全部活动',
    langText: 'English',
    showPrivacy: false,
    categories: [
      { key: 'all', label: '全部', icon: '🌟' },
      { key: 'active', label: '进行中', icon: '🟢' },
      { key: 'upcoming', label: '即将开始', icon: '⏰' },
      { key: 'sport', label: '运动', icon: '⚽' },
      { key: 'culture', label: '文化', icon: '🎭' },
      { key: 'volunteer', label: '公益', icon: '❤️' },
      { key: 'social', label: '社交', icon: '🎊' },
    ],
  },

  onLoad() {
    const app = getApp()
    if (!app.globalData.privacyAgreed) {
      this.setData({ showPrivacy: true })
      return
    }
    this._init()
  },

  onShow() {
    // 同步自定义 tabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(0)
    }
    const app = getApp()
    if (app.globalData.privacyAgreed && !this.data.activities.length) {
      this._init()
    }
  },

  _init() {
    this.setData({ langText: i18n.getLanguage() === 'zh' ? 'English' : '中文' })
    this._loadActivities(true)
    this._loadBanners()
  },

  onPrivacyConfirm() {
    const app = getApp()
    app.globalData.privacyAgreed = true
    this.setData({ showPrivacy: false })
    app._autoLogin().then(() => this._init())
  },

  async _loadActivities(reset = false) {
    if (this.data.loading || this.data.loadingMore) return
    const page = reset ? 1 : this.data.page

    this.setData({ [reset ? 'loading' : 'loadingMore']: true })
    if (reset) this.setData({ activities: [], noMore: false })

    try {
      const res = await request.get('/activities', {
        page,
        size: PAGE_SIZE,
        category: this.data.activeCategory === 'all' ? undefined : this.data.activeCategory,
      })
      const list = (res.data?.list || []).map(a => ({
        ...a,
        startTimeText: formatDate(a.startTime, 'MM月DD日 HH:mm'),
      }))
      this.setData({
        activities: reset ? list : [...this.data.activities, ...list],
        page: page + 1,
        noMore: list.length < PAGE_SIZE,
      })
    } catch (e) {
      console.error('加载活动失败', e)
    } finally {
      this.setData({ loading: false, loadingMore: false, refreshing: false })
    }
  },

  async _loadBanners() {
    try {
      const res = await request.get('/activities/featured')
      this.setData({
        bannerList: (res.data || []).map(a => ({
          ...a,
          startTimeText: formatDate(a.startTime, 'MM月DD日'),
        })),
      })
    } catch (e) {}
  },

  onCategoryChange(e) {
    const key = e.currentTarget.dataset.key
    const catMap = {
      all: '全部活动', active: '进行中的活动', upcoming: '即将开始',
      sport: '运动活动', culture: '文化活动', volunteer: '公益活动', social: '社交活动',
    }
    this.setData({ activeCategory: key, listTitle: catMap[key] || '全部活动' })
    this._loadActivities(true)
  },

  onActivityTap(e) {
    wx.navigateTo({ url: `/pages/activity-detail/index?id=${e.detail.id}` })
  },

  onBannerTap(e) {
    wx.navigateTo({ url: `/pages/activity-detail/index?id=${e.currentTarget.dataset.id}` })
  },

  onSearchTap() {
    wx.navigateTo({ url: '/pages/search/index' })
  },

  onCreateActivity() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/create-activity/index' })
  },

  openFilter() {
    wx.showActionSheet({
      itemList: ['最新发布', '即将开始', '报名人数最多', '附近活动'],
      success: (res) => {
        const sorts = ['createdAt', 'startTime', 'registrationCount', 'distance']
        // TODO: 应用排序
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

  onRefresh() {
    this.setData({ refreshing: true })
    this._loadActivities(true)
  },

  onScrollToLower() {
    if (!this.data.noMore) this._loadActivities()
  },

  onPullDownRefresh() {
    this._loadActivities(true)
    wx.stopPullDownRefresh()
  },
})
