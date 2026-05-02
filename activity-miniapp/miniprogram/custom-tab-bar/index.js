// custom-tab-bar/index.js
Component({
  data: {
    selected: 0,
    animate: false,
    indicatorVisible: false,
    indicatorX: 0,
    indicatorW: 160,
    glowCenterPx: 0,
    tabs: [
      {
        text: '发现',
        pagePath: '/pages/index/index',
        icon: '/images/icon-discover.svg',
        iconActive: '/images/icon-discover-active.svg',
      },
      {
        text: '我的',
        pagePath: '/pages/my/index',
        icon: '/images/icon-my.svg',
        iconActive: '/images/icon-my-active.svg',
      },
    ],
  },

  attached() {
    let winW = 375
    try {
      if (typeof wx.getWindowInfoSync === 'function') {
        winW = wx.getWindowInfoSync().windowWidth
      } else {
        winW = wx.getSystemInfoSync().windowWidth
      }
    } catch (e) {
      winW = 375
    }
    this._tabW = winW / 2
    this._winW = winW
    this._updateIndicator(this.data.selected, false)

    setTimeout(() => {
      this.setData({ animate: true })
      setTimeout(() => this.setData({ indicatorVisible: true }), 150)
    }, 80)
  },

  methods: {
    /** 切换 tab */
    onTabTap(e) {
      const index = parseInt(e.currentTarget.dataset.index)
      if (index === this.data.selected) return
      this._updateIndicator(index, true)
      this.setData({ selected: index })
      wx.switchTab({ url: this.data.tabs[index].pagePath })
    },

    /** 供各页面 onShow 调用：同步选中态 */
    setSelected(index) {
      if (this.data.selected !== index) {
        this.setData({ selected: index })
        this._updateIndicator(index, false)
      }
    },

    /** 指示器宽度、位移与模糊光晕：均以「半个屏幕宽」为单位水平居中对齐到当前 Tab */
    _updateIndicator(index, animate) {
      const w = this._tabW || 187.5
      const inset = 28
      const indicatorW = Math.max(96, Math.floor(w - inset * 2))
      const indicatorX = index * w + (w - indicatorW) / 2
      const glowCenterPx = index * w + w / 2

      this.setData({
        indicatorX,
        indicatorW,
        glowCenterPx,
      })
    },
  },
})
