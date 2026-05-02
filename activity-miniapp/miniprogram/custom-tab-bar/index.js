// custom-tab-bar/index.js
Component({
  data: {
    selected: 0,
    animate: false,
    indicatorVisible: false,
    indicatorX: '0px',
    glowLeft: '-20px',
    tabs: [
      { text: '发现', pagePath: '/pages/index/index' },
      { text: '我的',  pagePath: '/pages/my/index'   },
    ],
  },

  attached() {
    // 延迟触发入场弹出动画
    setTimeout(() => {
      this.setData({ animate: true })
      setTimeout(() => this.setData({ indicatorVisible: true }), 150)
    }, 80)

    // 获取屏幕宽度，计算指示器偏移量
    wx.getSystemInfo({
      success: (res) => {
        const w = res.windowWidth
        this._tabW = w / 2  // 每个 tab 宽度（px）
        this._updateIndicator(this.data.selected, false)
      },
    })
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

    /** 计算指示器位置和光晕位置 */
    _updateIndicator(index, animate) {
      const w = this._tabW || 180  // px
      const x = index * w          // 向右偏移 index × tab宽度
      const glowOffset = x - (w / 2 - 60) // 光晕居中于当前 tab

      if (!animate) {
        // 无动画直接跳位
        this.setData({
          indicatorX: `${x}px`,
          glowLeft: `${glowOffset}px`,
        })
      } else {
        this.setData({
          indicatorX: `${x}px`,
          glowLeft: `${glowOffset}px`,
        })
      }
    },
  },
})
