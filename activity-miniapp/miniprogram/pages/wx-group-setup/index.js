// pages/wx-group-setup/index.js
const request = require('../../utils/request')

Page({
  data: {
    activityId: null,
    activityNameFallback: '',
    wxGroupChatName: '',
    wxGroupChatQrcodeUrl: '',
    previewUrl: '',
    submitting: false,
  },

  onLoad(options) {
    const id = options.id
    if (!id) {
      wx.showToast({ title: '缺少活动参数', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1600)
      return
    }
    this.setData({ activityId: id })
    this._loadActivity(id)
  },

  async _loadActivity(id) {
    wx.showLoading({ title: '加载中...' })
    try {
      const res = await request.get(`/activities/${id}`)
      const a = res.data || {}
      const nameDefault = (a.name || '').trim()
      const existingName = (a.wxGroupChatName || '').trim()
      const url = (a.wxGroupChatQrcodeUrl || '').trim()
      this.setData({
        activityNameFallback: nameDefault,
        wxGroupChatName: existingName || nameDefault,
        wxGroupChatQrcodeUrl: url,
        previewUrl: url,
      })
    } catch (e) {
      wx.showToast({ title: e.message || '加载失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  onNameInput(e) {
    this.setData({ wxGroupChatName: e.detail.value })
  },

  clearQrcode() {
    this.setData({ wxGroupChatQrcodeUrl: '', previewUrl: '' })
  },

  async chooseQrcodeImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFile = res.tempFiles[0].tempFilePath
        wx.showLoading({ title: '上传中...' })
        try {
          const uploadRes = await request.upload('/upload/image', tempFile)
          const url = uploadRes.data?.url || uploadRes.data
          if (!url) throw new Error('上传无返回地址')
          this.setData({ wxGroupChatQrcodeUrl: url, previewUrl: url })
        } catch (e) {
          wx.showToast({ title: e.message || '上传失败', icon: 'none' })
        } finally {
          wx.hideLoading()
        }
      },
    })
  },

  async onSave() {
    const { activityId, wxGroupChatName, wxGroupChatQrcodeUrl, activityNameFallback, submitting } =
      this.data
    if (submitting) return
    const nameTrim = wxGroupChatName.trim() || activityNameFallback
    if (!wxGroupChatQrcodeUrl?.trim()) {
      const ok = await new Promise((r) =>
        wx.showModal({
          title: '未上传二维码',
          content: '保存后将清空交流活动二维码（名单仍可在群中自行分享）。确认继续？',
          success: r,
        }),
      )
      if (!ok.confirm) return
    }

    this.setData({ submitting: true })
    try {
      await request.put(`/activities/${activityId}/wx-group`, {
        wxGroupChatName: nameTrim.slice(0, 200),
        wxGroupChatQrcodeUrl: (wxGroupChatQrcodeUrl || '').trim(),
      })
      wx.showToast({ title: '已保存', icon: 'success' })
      setTimeout(() => {
        wx.redirectTo({ url: `/pages/activity-detail/index?id=${activityId}` })
      }, 800)
    } catch (e) {
      // request 封裝已 toast
    } finally {
      this.setData({ submitting: false })
    }
  },
})
