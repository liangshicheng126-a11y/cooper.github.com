// pages/index/index.js
const request = require('../../utils/request')
const i18n = require('../../utils/i18n')
const { withListRowTimes, bannerRowStartTime } = require('../../utils/activityFormat')

const PAGE_SIZE = 10

/** 列表区标题文案 key → i18n */
const LIST_TITLE_KEYS = {
  all: 'listTitleAll',
  active: 'listTitleActive',
  upcoming: 'listTitleUpcoming',
  sport: 'listTitleSport',
  culture: 'listTitleCulture',
  volunteer: 'listTitleVolunteer',
  social: 'listTitleSocial',
}

/** 分类横向标签：图标与 i18n key */
const CATEGORY_DEF = [
  { key: 'all', icon: '🌟', labelKey: 'catAll' },
  { key: 'active', icon: '🟢', labelKey: 'catActive' },
  { key: 'upcoming', icon: '⏰', labelKey: 'catUpcoming' },
  { key: 'sport', icon: '⚽', labelKey: 'catSport' },
  { key: 'culture', icon: '🎭', labelKey: 'catCulture' },
  { key: 'volunteer', icon: '❤️', labelKey: 'catVolunteer' },
  { key: 'social', icon: '🎊', labelKey: 'catSocial' },
]

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
    localeRev: 0,
    searchPlaceholder: '',
    filterBtnLabel: '',
    emptyActivities: '',
    emptySubActivities: '',
    loadingEllipsis: '',
    loadedAllFooter: '',
    showPrivacy: false,
    categories: [],
    /** 列表排序：latest | soon | popular | distance */
    listSort: 'createdAt',
    sortUserLat: null,
    sortUserLng: null,
  },

  onLoad() {
    const app = getApp()
    if (!app.globalData.privacyAgreed) {
      this.setData({ showPrivacy: true })
      return
    }
    this._initMeta()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(0)
    }
    const app = getApp()
    if (!app.globalData.privacyAgreed) return
    if (app.globalData.refreshHomeActivityListNextShow) {
      app.globalData.refreshHomeActivityListNextShow = false
      this.setData({ activeCategory: 'all' })
    }
    this._applyLocale()
    this._loadActivities(true)
  },

  onPrivacyConfirm() {
    const app = getApp()
    app.globalData.privacyAgreed = true
    this.setData({ showPrivacy: false })
    app._autoLogin().then(() => {
      this._initMeta()
      this._loadActivities(true)
    })
  },

  // 初始化语言、banner 等非列表内容（只需执行一次）
  _initMeta() {
    this._applyLocale()
    this._loadBanners()
  },

  /** 将界面文案、分类与语言对齐；仅在语言切换时刷新 localeRev 与已缓存列表的日期格式，避免每次 onShow 整表重算 */
  _applyLocale() {
    const cur = i18n.getLanguage()
    const first = this._i18nSyncedLang === undefined
    const langChanged = first || this._i18nSyncedLang !== cur
    this._i18nSyncedLang = cur

    const categories = CATEGORY_DEF.map(({ key, icon, labelKey }) => ({
      key,
      icon,
      label: i18n.t(labelKey),
    }))
    const activeKey = this.data.activeCategory || 'all'
    const lk = LIST_TITLE_KEYS[activeKey] || 'listTitleAll'

    const patch = {
      categories,
      listTitle: i18n.t(lk),
      langText: i18n.t('switchLang'),
      searchPlaceholder: i18n.t('searchPlaceholder'),
      filterBtnLabel: i18n.t('filterBtn'),
      emptyActivities: i18n.t('emptyActivities'),
      emptySubActivities: i18n.t('emptySubActivities'),
      loadingEllipsis: i18n.t('loadingEllipsis'),
      loadedAllFooter: i18n.t('loadedAllFooter'),
    }

    if (langChanged) {
      patch.bannerList = (this.data.bannerList || []).map((a) => ({
        ...a,
        startTimeText: bannerRowStartTime(a.startTime),
      }))
      patch.activities = (this.data.activities || []).map(withListRowTimes)
      patch.localeRev = (this.data.localeRev || 0) + 1
    }

    this.setData(patch)
  },

  async _loadActivities(reset = false) {
    // reset 时必须允许打断进行中的分页加载，否则会跳过刷新导致看不到刚发布的活动
    if (!reset && (this.data.loading || this.data.loadingMore)) return
    const page = reset ? 1 : this.data.page

    if (reset) {
      this.setData({ loading: true, activities: [], noMore: false })
    } else {
      this.setData({ loadingMore: true })
    }

    try {
      const q = { page, size: PAGE_SIZE, sort: this.data.listSort }
      const cat = this.data.activeCategory
      if (cat && cat !== 'all') q.category = cat

      if (this.data.listSort === 'distance') {
        let lat = this.data.sortUserLat
        let lng = this.data.sortUserLng
        if (reset || lat == null || lng == null) {
          try {
            const loc = await new Promise((resolve, reject) => {
              wx.getLocation({ type: 'gcj02', success: resolve, fail: reject })
            })
            lat = loc.latitude
            lng = loc.longitude
            this.setData({ sortUserLat: lat, sortUserLng: lng })
          } catch (e) {
            wx.showToast({ title: i18n.t('sortNeedLocation'), icon: 'none' })
            this.setData({ loading: false, loadingMore: false, refreshing: false })
            return
          }
        }
        if (lat != null && lng != null) {
          q.lat = lat
          q.lng = lng
        }
      }

      const res = await request.get('/activities', q)
      const list = (res.data?.list || []).map((a) => withListRowTimes({ ...a }))
      this.setData({
        activities: reset ? list : [...this.data.activities, ...list],
        page: page + 1,
        noMore: list.length < PAGE_SIZE,
      })
    } catch (e) {
      console.error('加载活动失败', e)
      wx.showToast({ title: e.message || i18n.t('listLoadFail'), icon: 'none', duration: 2500 })
    } finally {
      this.setData({ loading: false, loadingMore: false, refreshing: false })
    }
  },

  async _loadBanners() {
    try {
      const res = await request.get('/activities/featured')
      this.setData({
        bannerList: (res.data || []).map((a) => ({
          ...a,
          startTimeText: bannerRowStartTime(a.startTime),
        })),
      })
    } catch (e) {}
  },

  onCategoryChange(e) {
    const key = e.currentTarget.dataset.key
    const lk = LIST_TITLE_KEYS[key] || 'listTitleAll'
    this.setData({ activeCategory: key, listTitle: i18n.t(lk) })
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
      wx.showToast({ title: i18n.t('plsLogin'), icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/create-activity/index' })
  },

  openFilter() {
    wx.showActionSheet({
      itemList: [
        i18n.t('sortNewest'),
        i18n.t('sortUpcoming'),
        i18n.t('sortPopular'),
        i18n.t('sortNearby'),
      ],
      success: (res) => {
        const sorts = ['createdAt', 'startTime', 'registrationCount', 'distance']
        const listSort = sorts[res.tapIndex] || 'createdAt'
        if (listSort !== 'distance') {
          this.setData({ listSort, sortUserLat: null, sortUserLng: null })
        } else {
          this.setData({ listSort })
        }
        this._loadActivities(true)
      },
    })
  },

  toggleLanguage() {
    const app = getApp()
    const newLang = app.globalData.language === 'zh' ? 'en' : 'zh'
    app.setLanguage(newLang)
    this._applyLocale()
    const tabBar = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tabBar && typeof tabBar.applyLocale === 'function') {
      tabBar.applyLocale()
    }
    wx.showToast({
      title: i18n.t(newLang === 'zh' ? 'switchedZh' : 'switchedEn'),
      icon: 'none',
    })
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

  onShareAppMessage() {
    return {
      title: i18n.t('shareDiscoverTitle'),
      path: '/pages/index/index',
      imageUrl: this.data.bannerList[0]?.coverImage || '',
    }
  },

  onShareTimeline() {
    return {
      title: i18n.t('shareDiscoverTitle'),
      query: '',
      imageUrl: this.data.bannerList[0]?.coverImage || '',
    }
  },
})
