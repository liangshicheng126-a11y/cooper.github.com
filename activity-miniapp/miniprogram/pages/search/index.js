// pages/search/index.js
const request = require('../../utils/request')
const { getCustomNavbarContentPaddingTop } = require('../../utils/nav')
const { formatDate, getActivityStatus } = require('../../utils/date')

const HISTORY_KEY = 'search_history'
const STATUS_TEXT = { active: '进行中', upcoming: '未开始', ended: '已结束', full: '已报满' }
const STATUS_CLASS = { active: 'status-mini-active', upcoming: 'status-mini-upcoming', ended: 'status-mini-ended', full: 'status-mini-full' }

Page({
  data: {
    keyword: '',
    results: [],
    history: [],
    hotWords: ['音乐节', '马拉松', '志愿活动', '技术分享', '户外露营', '读书会'],
    loading: false,
    searched: false,
    navBarPaddingTop: 48,
  },

  onLoad(options) {
    this.setData({ navBarPaddingTop: getCustomNavbarContentPaddingTop() })
    const history = wx.getStorageSync(HISTORY_KEY) || []
    this.setData({ history })
    if (options.keyword) {
      this.setData({ keyword: options.keyword })
      this._doSearch(options.keyword)
    }
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  onClear() {
    this.setData({ keyword: '', results: [], searched: false })
  },

  onSearch() {
    const kw = this.data.keyword.trim()
    if (!kw) return
    this._doSearch(kw)
  },

  onHistoryTap(e) {
    const kw = e.currentTarget.dataset.kw
    this.setData({ keyword: kw })
    this._doSearch(kw)
  },

  clearHistory() {
    wx.removeStorageSync(HISTORY_KEY)
    this.setData({ history: [] })
  },

  async _doSearch(kw) {
    if (this.data.loading) return
    this.setData({ loading: true, searched: true })
    try {
      const res = await request.get('/activities', { keyword: kw, size: 30 })
      const list = (res.data?.list || []).map(a => {
        const status = getActivityStatus(a)
        return {
          ...a,
          startTimeText: formatDate(a.startTime, 'MM月DD日 HH:mm'),
          statusText: STATUS_TEXT[status] || status,
          statusClass: STATUS_CLASS[status] || '',
        }
      })
      this.setData({ results: list })
      // 保存历史
      const history = [kw, ...(this.data.history.filter(h => h !== kw))].slice(0, 10)
      wx.setStorageSync(HISTORY_KEY, history)
      this.setData({ history })
    } catch (e) {
      wx.showToast({ title: '搜索失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  onActivityTap(e) {
    wx.navigateTo({ url: `/pages/activity-detail/index?id=${e.detail.id}` })
  },

  goBack() {
    wx.navigateBack()
  },
})
