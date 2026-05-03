// pages/checkin/index.js
const request = require('../../utils/request')
const { formatDate } = require('../../utils/date')
const { dataUrlToLocalFile } = require('../../utils/qrImage')

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

/** 主办方核验码定时刷新（与后端小时 token 对齐，避免长时间挂页后码失效） */
const ADMIN_QR_REFRESH_MS = 30 * 60 * 1000

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
      this._adminFirstShow = true
      this._loadQRCode()
      this.loadCheckinList()
      this._startAdminQrAutoRefresh()
    }
  },

  onShow() {
    if (this.data.mode !== 'admin' || !this.data.activityId) return
    if (this._adminFirstShow) {
      this._adminFirstShow = false
      return
    }
    this._loadQRCode({ silent: true })
    this.loadCheckinList()
    this._startAdminQrAutoRefresh()
  },

  onUnload() {
    this._stopAdminQrAutoRefresh()
  },

  onHide() {
    this._stopAdminQrAutoRefresh()
  },

  _startAdminQrAutoRefresh() {
    this._stopAdminQrAutoRefresh()
    this._adminQrTimer = setInterval(() => {
      if (this.data.mode !== 'admin' || !this.data.activityId) return
      this._loadQRCode({ silent: true })
      this.loadCheckinList()
    }, ADMIN_QR_REFRESH_MS)
  },

  _stopAdminQrAutoRefresh() {
    if (this._adminQrTimer) {
      clearInterval(this._adminQrTimer)
      this._adminQrTimer = null
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
    const scene = decodeURIComponent(encodedScene).trim()

    // 个人主体：小程序码 scene 为 16 位 hex，后端 Redis 映射 activityId + token
    if (/^[0-9a-fA-F]{16}$/.test(scene)) {
      const code = scene.toLowerCase()
      this.setData({ mode: 'user' })
      try {
        await this._ensureLoggedIn()
      } catch (e) {
        wx.showToast({ title: '请先登录后再签到', icon: 'none' })
      }
      let activityId
      let token
      try {
        const res = await request.get(`/checkin/scene/${code}`)
        activityId = res.data?.activityId
        token = res.data?.token
      } catch (e) {
        await this._loadActivityInfo()
        return
      }
      if (!activityId || !token) {
        wx.showToast({ title: '无效的签到码', icon: 'none' })
        await this._loadActivityInfo()
        return
      }
      this.setData({ activityId })
      await this._handleScanCheckin(activityId, token)
      await this._loadActivityInfo()
      if (this.data.checkinDone) {
        const name = this.data.activityName || '活动'
        wx.setNavigationBarTitle({ title: name + ' · 签到' })
      }
      return
    }

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

  async _loadQRCode(opts = {}) {
    const { silent } = opts
    const firstPaint = !this.data.qrcodeUrl
    if (firstPaint && !silent) {
      wx.showLoading({ title: '生成核验码...', mask: true })
    }
    try {
      const res = await request.get(`/activities/${this.data.activityId}/checkin-qrcode`)
      const raw = res.data?.qrcodeUrl
      if (!raw) {
        if (!silent) wx.showToast({ title: '未获取到二维码', icon: 'none' })
        return
      }
      let displayUrl = raw
      try {
        displayUrl = await dataUrlToLocalFile(raw, this.data.activityId)
      } catch (err) {
        console.warn('[checkin] dataUrl 落盘失败，尝试直接使用:', err)
      }
      this.setData({
        qrcodeUrl: displayUrl,
        totalRegistrations: res.data.totalRegistrations || 0,
      })
    } catch (e) {
      if (!silent) {
        wx.showToast({ title: e.message || '核验码生成失败', icon: 'none' })
      }
    } finally {
      if (firstPaint && !silent) {
        wx.hideLoading()
      }
    }
  },

  onQrImageError(e) {
    console.error('[checkin] 二维码图加载失败', e.detail)
    wx.showToast({ title: '二维码显示失败，请点手动刷新', icon: 'none' })
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

  async refreshQR() {
    await this._loadQRCode()
    if (this.data.qrcodeUrl) {
      wx.showToast({ title: '已重新生成', icon: 'success' })
    }
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
