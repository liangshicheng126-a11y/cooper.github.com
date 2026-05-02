// components/privacy-modal/index.js
Component({
  properties: {
    show: { type: Boolean, value: false },
  },
  data: {
    agreed: false,
  },
  methods: {
    toggleAgree() {
      this.setData({ agreed: !this.data.agreed })
    },
    onConfirm() {
      if (!this.data.agreed) return
      wx.setStorageSync('privacyAgreed', true)
      wx.setStorageSync('privacyAgreedTime', new Date().toISOString())
      this.triggerEvent('confirm')
    },
    onDecline() {
      wx.showModal({
        title: '提示',
        content: '不同意隐私协议将无法使用本小程序',
        confirmText: '退出',
        cancelText: '返回',
        success: (res) => {
          if (res.confirm) wx.exitMiniProgram()
        },
      })
    },
    onMaskTap() { /* 不关闭 */ },
    stop() { /* 阻止冒泡 */ },
    openPrivacy() {
      wx.navigateTo({ url: '/pages/privacy/index' })
    },
    openTerms() {
      wx.navigateTo({ url: '/pages/terms/index' })
    },
  },
})
