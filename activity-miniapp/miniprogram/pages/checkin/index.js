// pages/checkin/index.js
const request = require('../../utils/request')
const { formatDate } = require('../../utils/date')

Page({
  data: {
    activityId: null,
    mode: 'user', // 'admin' | 'user'
    activityName: '',
    qrcodeUrl: '',
    totalRegistrations: 0,
    checkinList: [],
    checkinDone: false,
    checkinTimeText: '',
  },

  onLoad(options) {
    this.setData({
      activityId: options.activityId || options.id,
      mode: options.mode || 'user',
    })
    if (options.scene) {
      // 小程序码解析 scene 参数，格式: activityId=xxx
      const scene = decodeURIComponent(options.scene)
      const params = Object.fromEntries(scene.split('&').map(s => s.split('=')))
      this.setData({ activityId: params.activityId })
      this._handleScanCheckin(params.activityId, params.token)
      return
    }
    this._loadActivityInfo()
    if (this.data.mode === 'admin') {
      this._loadQRCode()
      this.loadCheckinList()
    }
  },

  async _loadActivityInfo() {
    const id = this.data.activityId
    if (!id) return
    try {
      const res = await request.get(`/activities/${id}`)
      const name = res.data.name || '活动'
      const barSuffix = this.data.mode === 'admin' ? ' · 核验' : ' · 签到'
      this.setData({ activityName: name })
      wx.setNavigationBarTitle({ title: name + barSuffix })
    } catch (e) {}
  },

  async _loadQRCode() {
    try {
      const res = await request.get(`/activities/${this.data.activityId}/checkin-qrcode`)
      this.setData({
        qrcodeUrl: res.data.qrcodeUrl,
        totalRegistrations: res.data.totalRegistrations || 0,
      })
    } catch (e) {}
  },

  async loadCheckinList() {
    try {
      const res = await request.get(`/admin/activities/${this.data.activityId}/checkins`)
      this.setData({
        checkinList: (res.data || []).map(r => ({
          ...r,
          checkinTimeText: formatDate(r.checkinTime, 'HH:mm:ss'),
        })),
      })
    } catch (e) {}
  },

  refreshQR() {
    this._loadQRCode()
    wx.showToast({ title: '已刷新', icon: 'success' })
  },

  saveQR() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.qrcodeUrl,
      success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
      fail: () => {
        wx.showModal({
          title: '保存失败',
          content: '请长按二维码图片保存',
        })
      },
    })
  },

  onScan() {
    wx.scanCode({
      success: async (res) => {
        try {
          const url = new URL(res.result)
          const activityId = url.searchParams.get('activityId')
          const token = url.searchParams.get('token')
          if (!activityId) throw new Error('invalid')
          await this._handleScanCheckin(activityId, token)
        } catch (e) {
          wx.showToast({ title: '无效的签到码', icon: 'none' })
        }
      },
      fail: () => {},
    })
  },

  async _handleScanCheckin(activityId, token) {
    wx.showLoading({ title: '签到中...' })
    try {
      const res = await request.post('/checkin', { activityId, token })
      const now = new Date()
      this.setData({
        checkinDone: true,
        activityName: res.data.activityName,
        checkinTimeText: formatDate(now.toISOString(), 'YYYY年MM月DD日 HH:mm:ss'),
      })
      wx.hideLoading()
      wx.vibrateShort({ type: 'heavy' })
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: e.message || '签到失败', icon: 'none' })
    }
  },
})
