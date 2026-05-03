// pages/checkin/index.js
const request = require('../../utils/request')
const { formatDate } = require('../../utils/date')

function parseSceneQuery(qs) {
  const out = {}
  String(qs)
    .split('&')
    .forEach((pair) => {
      if (!pair) return
      const i = pair.indexOf('=')
      const k = i === -1 ? pair : pair.slice(0, i)
      const v = i === -1 ? '' : decodeURIComponent(pair.slice(i + 1))
      out[k] = v
    })
  return out
}

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
      activityId: options.activityId || options.id || null,
      mode: options.mode || 'user',
    })

    // 微信 URL Link / 分享链接：query 直传 activityId + token（支持原生扫一扫打开）
    if (options.activityId && options.token) {
      this._entryWithToken(options.activityId, options.token)
      return
    }

    // 小程序码 scene（兼容旧码：仅有 activityId 时拉取当前 token）
    if (options.scene) {
      this._entryFromScene(options.scene)
      return
    }

    this._loadActivityInfo()
    if (this.data.mode === 'admin') {
      this._loadQRCode()
      this.loadCheckinList()
    }
  },

  async _ensureLoggedIn() {
    const app = getApp()
    if (app.globalData.token) return
    await app.wxLogin()
  },

  /** URL Link 进入：登录后自动提交签到 */
  async _entryWithToken(activityId, token) {
    this.setData({ activityId, mode: 'user' })
    try {
      await this._ensureLoggedIn()
    } catch (e) {
      wx.showToast({ title: '请先登录后再签到', icon: 'none' })
    }
    await this._handleScanCheckin(activityId, token)
    await this._loadActivityInfo()
    if (this.data.checkinDone) {
      const name = this.data.activityName || '活动'
      wx.setNavigationBarTitle({ title: name + ' · 签到' })
    }
  },

  async _entryFromScene(encodedScene) {
    const scene = decodeURIComponent(encodedScene)
    const params = parseSceneQuery(scene)
    const activityId = params.activityId
    this.setData({ activityId: activityId || null, mode: 'user' })
    if (!activityId) {
      wx.showToast({ title: '无效的签到码', icon: 'none' })
      this._loadActivityInfo()
      return
    }
    try {
      await this._ensureLoggedIn()
    } catch (e) {
      wx.showToast({ title: '请先登录后再签到', icon: 'none' })
    }
    let token = params.token
    if (!token && params.type === 'checkin') {
      try {
        const res = await request.get(`/checkin/${activityId}`)
        token = res.data?.token
      } catch (e) {
        token = null
      }
    }
    if (!token) {
      wx.showToast({ title: '请刷新现场二维码后重试', icon: 'none' })
      await this._loadActivityInfo()
      return
    }
    await this._handleScanCheckin(activityId, token)
    await this._loadActivityInfo()
    if (this.data.checkinDone) {
      const name = this.data.activityName || '活动'
      wx.setNavigationBarTitle({ title: name + ' · 签到' })
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
        checkinList: (res.data || []).map((r) => ({
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
        const raw = (res.result || '').trim()
        if (/^https:\/\/wxaurl\.cn\//i.test(raw)) {
          wx.showModal({
            title: '签到提示',
            content:
              '这是活动现场签到链接二维码。请关闭本页，在微信主界面使用右上角「扫一扫」对准海报扫码；或将二维码展示给其他参与者用微信扫描。',
            showCancel: false,
          })
          return
        }
        try {
          const url = new URL(raw)
          const activityId = url.searchParams.get('activityId')
          const token = url.searchParams.get('token')
          if (!activityId) throw new Error('invalid')
          await this._ensureLoggedIn()
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
