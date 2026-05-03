// pages/my-published/index.js
const request = require('../../utils/request')
const { getActivityStatus } = require('../../utils/date')
const { listRowStartTime } = require('../../utils/activityFormat')

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
    activities: [],
    loading: true,
  },

  onShow() {
    this._load()
  },

  async _load() {
    const app = getApp()
    if (!app.globalData.token) {
      this.setData({ loading: false, activities: [] })
      return
    }
    this.setData({ loading: true })
    try {
      const res = await request.get('/activities/my-created')
      const list = (res.data || []).map((a) => {
        const statusKey = getActivityStatus(a)
        const meta = STATUS_MAP[statusKey] || {}
        return {
          ...a,
          startTimeText: listRowStartTime(a.startTime),
          statusText: meta.text || '',
          statusClass: meta.cls || '',
        }
      })
      this.setData({ activities: list, loading: false })
    } catch (e) {
      this.setData({ loading: false, activities: [] })
    }
  },

  onActivityTap(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    wx.navigateTo({ url: `/pages/activity-detail/index?id=${id}` })
  },

  goCreate() {
    wx.navigateTo({ url: '/pages/create-activity/index' })
  },
})
