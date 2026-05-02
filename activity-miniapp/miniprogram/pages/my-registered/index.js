// pages/my-registered/index.js
const request = require('../../utils/request')
const { formatDate, getActivityStatus } = require('../../utils/date')

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
      const res = await request.get('/registrations/my')
      const list = (res.data || []).map(r => {
        const pseudo = {
          ...r,
          startTime: r.startTime,
          endTime: r.endTime,
        }
        const key = getActivityStatus(pseudo)
        return {
          ...r,
          name: r.activityName,
          startTimeText: formatDate(r.startTime, 'MM月DD日 HH:mm'),
          registeredAtText: formatDate(r.created_at, 'MM月DD日 HH:mm'),
          statusText: STATUS_MAP[key]?.text || '',
          statusClass: STATUS_MAP[key]?.cls || '',
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
