// pages/poster/index.js
const request = require('../../utils/request')
const { resolveMediaUrl } = require('../../utils/media')

Page({
  data: {
    activityId: null,
    activityName: '',
    posterUrl: '',
    posterFailed: false,
    generating: false,
    selectedStyle: 'modern',
    selectedColor: '#FF5A3D',
    extraText: '',
    posterStyles: [
      { key: 'modern', name: '现代简约', emoji: '🎨' },
      { key: 'colorful', name: '炫彩活泼', emoji: '🌈' },
      { key: 'minimal', name: '极简黑白', emoji: '⬛' },
      { key: 'nature', name: '自然清新', emoji: '🌿' },
      { key: 'tech', name: '科技感', emoji: '💻' },
      { key: 'retro', name: '复古风', emoji: '📻' },
    ],
    colorThemes: [
      { value: '#FF5A3D' }, { value: '#7C3AED' }, { value: '#FACC15' },
      { value: '#10B981' }, { value: '#EF4444' }, { value: '#06B6D4' },
      { value: '#EC4899' }, { value: '#251A34' },
    ],
  },

  onLoad(options) {
    this.setData({ activityId: options.activityId })
    this._loadActivity()
  },

  async _loadActivity() {
    try {
      const res = await request.get(`/activities/${this.data.activityId}`)
      this.setData({ activityName: res.data.name })
    } catch (e) {}
  },

  selectStyle(e) {
    this.setData({ selectedStyle: e.currentTarget.dataset.key })
  },

  selectColor(e) {
    this.setData({ selectedColor: e.currentTarget.dataset.value })
  },

  onExtraInput(e) {
    this.setData({ extraText: e.detail.value })
  },

  async generatePoster() {
    this.setData({ generating: true, posterFailed: false })
    try {
      const res = await request.post('/ai/generate-poster', {
        activityId: this.data.activityId,
        style: this.data.selectedStyle,
        color: this.data.selectedColor,
        extraText: this.data.extraText,
      })
      const posterUrl = resolveMediaUrl(res.data?.posterUrl)
      if (!posterUrl) throw new Error('未获取到海报图片')
      this.setData({ posterUrl, posterFailed: false })
    } catch (e) {
      wx.showToast({ title: e.message || '生成失败，请重试', icon: 'none' })
    } finally {
      this.setData({ generating: false })
    }
  },

  regenerate() {
    this.setData({ posterUrl: '', posterFailed: false })
  },

  onPosterError() {
    wx.showToast({ title: '海报图片加载失败，请重新生成', icon: 'none' })
    this.setData({ posterUrl: '', posterFailed: true })
  },

  savePoster() {
    const posterUrl = this.data.posterUrl
    if (!posterUrl) {
      wx.showToast({ title: '请先生成海报', icon: 'none' })
      return
    }
    this._getPosterLocalPath(posterUrl).then((filePath) => {
      wx.saveImageToPhotosAlbum({
        filePath,
        success: () => wx.showToast({ title: '海报已保存到相册', icon: 'success' }),
        fail: (err) => {
          if (err.errMsg && err.errMsg.includes('auth')) {
            wx.showModal({
              title: '需要相册权限',
              content: '请在设置中允许访问相册',
              confirmText: '去设置',
              success: (r) => { if (r.confirm) wx.openSetting() },
            })
            return
          }
          wx.showToast({ title: '保存失败，请重试', icon: 'none' })
        },
      })
    }).catch((e) => {
      wx.showToast({ title: e.message || '保存失败，请重试', icon: 'none' })
    })
  },

  _getPosterLocalPath(url) {
    if (/^(wxfile|http:\/\/tmp|file):\/\//i.test(url)) return Promise.resolve(url)
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300 && res.tempFilePath) {
            resolve(res.tempFilePath)
          } else {
            reject(new Error('海报下载失败'))
          }
        },
        fail: () => reject(new Error('海报下载失败')),
      })
    })
  },

  sharePoster() {
    wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] })
  },

  onShareAppMessage() {
    return {
      title: this.data.activityName,
      path: `/pages/activity-detail/index?id=${this.data.activityId}`,
      imageUrl: this.data.posterUrl,
    }
  },
})
