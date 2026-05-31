// pages/my-published/index.js
const request = require('../../utils/request')
const { listRowStartTime } = require('../../utils/activityFormat')
const { withActivityMedia } = require('../../utils/media')
const { getStatusMeta } = require('../../utils/activityStatus')

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
        const meta = getStatusMeta(a, 'mini')
        const mod = a.moderationStatus || 'passed'
        let modBadge = ''
        if (mod === 'pending') modBadge = ' · 审核中'
        else if (mod === 'rejected') modBadge = ' · 未过审'
        return withActivityMedia({
          ...a,
          startTimeText: listRowStartTime(a.startTime),
          statusText: meta.text + modBadge,
          statusClass: meta.className,
        })
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
