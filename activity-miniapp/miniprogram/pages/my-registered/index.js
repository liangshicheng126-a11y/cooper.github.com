// pages/my-registered/index.js
const request = require('../../utils/request')
const { listRowStartTime } = require('../../utils/activityFormat')
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
      const res = await request.get('/registrations/my')
      const list = (res.data || []).map(r => {
        const pseudo = {
          ...r,
          startTime: r.startTime,
          endTime: r.endTime,
        }
        const meta = getStatusMeta(pseudo, 'mini')
        return {
          ...r,
          name: r.activityName,
          startTimeText: listRowStartTime(r.startTime),
          registeredAtText: listRowStartTime(r.created_at || r.createdAt),
          statusText: meta.text,
          statusClass: meta.className,
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

  goDiscover() {
    wx.switchTab({ url: '/pages/index/index' })
  },
})
