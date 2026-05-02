// components/location-picker/index.js
Component({
  properties: {
    show: { type: Boolean, value: false },
  },

  data: {
    mode: 'china',   // 'china' | 'intl'
    keyword: '',
    results: [],
    loading: false,
    searched: false,
  },

  methods: {
    onClose() {
      this.triggerEvent('close')
    },

    setModeChina() {
      this.setData({ mode: 'china', results: [], keyword: '', searched: false })
    },

    setModeIntl() {
      this.setData({ mode: 'intl', results: [], keyword: '', searched: false })
    },

    // ── 国内：调腾讯地图 ──────────────────────────
    pickChina() {
      this.setData({ loading: true })
      wx.chooseLocation({
        success: (res) => {
          this.setData({ loading: false })
          this.triggerEvent('select', {
            name:      res.name || res.address,
            address:   res.address,
            latitude:  res.latitude,
            longitude: res.longitude,
            country:   'CN',
          })
        },
        fail: (err) => {
          this.setData({ loading: false })
          if (!err.errMsg?.includes('cancel')) {
            wx.showToast({ title: '选择地点失败', icon: 'none' })
          }
        },
      })
    },

    // ── 海外：Nominatim 搜索 ───────────────────────
    onKeywordInput(e) {
      this.setData({ keyword: e.detail.value })
    },

    doSearch() {
      const { keyword } = this.data
      if (!keyword.trim()) return wx.showToast({ title: '请输入地址关键词', icon: 'none' })

      this.setData({ loading: true, results: [], searched: false })

      wx.request({
        url: 'https://nominatim.openstreetmap.org/search',
        data: {
          q:              keyword,
          format:         'json',
          addressdetails: 1,
          limit:          8,
          'accept-language': 'zh-CN,zh,en',
        },
        header: {
          'User-Agent': 'ActivityMiniApp/1.0',
        },
        success: (res) => {
          if (!Array.isArray(res.data)) {
            this.setData({ loading: false, searched: true })
            return
          }
          const results = res.data.map(item => {
            // 构建简短名称：取 name 或地址的第一段
            const addr = item.address || {}
            const shortParts = [
              addr.tourism || addr.amenity || addr.shop ||
              addr.building || addr.road || addr.neighbourhood ||
              addr.suburb || addr.city_district || item.name,
              addr.city || addr.town || addr.village || addr.county,
              addr.state || addr.province || addr.region,
              addr.country,
            ].filter(Boolean)

            return {
              place_id:          item.place_id,
              display_name:      item.display_name,
              display_name_short: shortParts.slice(0, 3).join('，') || item.display_name.split(',')[0],
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
            }
          })
          this.setData({ results, loading: false, searched: true })
        },
        fail: () => {
          this.setData({ loading: false, searched: true })
          wx.showToast({ title: '搜索失败，请检查网络', icon: 'none' })
        },
      })
    },

    onSelectResult(e) {
      const idx = e.currentTarget.dataset.idx
      const item = this.data.results[idx]
      this.triggerEvent('select', {
        name:      item.display_name_short,
        address:   item.display_name,
        latitude:  item.lat,
        longitude: item.lon,
        country:   'INTL',
      })
    },
  },
})
