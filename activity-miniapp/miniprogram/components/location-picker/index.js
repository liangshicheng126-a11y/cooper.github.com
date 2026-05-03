// components/location-picker/index.js
const { MAP_KEY } = require('../../utils/config')

const isTencentConfigured = MAP_KEY && MAP_KEY !== 'YOUR_TENCENT_MAP_KEY'

Component({
  properties: {
    show: { type: Boolean, value: false },
  },

  data: {
    step: 'search',
    mode: 'china',
    textAddress: '',
    geocoding: false,

    pendingLocation: { name: '', address: '', latitude: 0, longitude: 0 },
    originalLocation: null,
    mapMarkers: [],
    mapScale: 16,
    pinMoved: false,
  },

  methods: {
    preventTapBubble() {},
    preventTouchBubble() {},
    onClose() { this.triggerEvent('close') },

    setModeChina() {
      this.setData({ mode: 'china', textAddress: '', step: 'search' })
    },
    setModeIntl() {
      this.setData({ mode: 'intl', textAddress: '', step: 'search' })
    },

    onTextAddressInput(e) {
      this.setData({ textAddress: e.detail.value })
    },

    _emitIntlSelect({ name, address, latitude = null, longitude = null, country = 'INTL' }) {
      const lat =
        latitude != null && latitude !== '' && Number.isFinite(Number(latitude))
          ? Number(latitude)
          : null
      const lng =
        longitude != null && longitude !== '' && Number.isFinite(Number(longitude))
          ? Number(longitude)
          : null
      this.triggerEvent('select', {
        name,
        address,
        latitude: lat,
        longitude: lng,
        country,
      })
    },

    /** 海外：不解析、不地理编码；原文登记（仅按库表长度截断），并打日志 */
    confirmIntlTextOnly() {
      const raw = this.data.textAddress
      if (raw.length === 0) {
        return wx.showToast({ title: '请输入地址', icon: 'none' })
      }
      const address = raw.length > 500 ? raw.slice(0, 500) : raw
      const name = address.length > 200 ? address.slice(0, 200) : address
      console.log('[location-picker][intl] 海外地址原文登记', {
        addressLength: address.length,
        nameLength: name.length,
        address,
        name,
      })
      this._emitIntlSelect({ name, address, country: 'INTL' })
    },

    geocodeTextAddress() {
      const addr = this.data.textAddress.trim()
      if (!addr) return wx.showToast({ title: '请输入地址', icon: 'none' })
      if (!isTencentConfigured) {
        return this._nominatimGeocodeAndEnter(addr, { countrycodes: 'cn', region: 'CN' })
      }
      this.setData({ geocoding: true })
      wx.request({
        url: `https://apis.map.qq.com/ws/geocoder/v1/?address=${encodeURIComponent(addr)}&key=${MAP_KEY}`,
        success: (res) => {
          this.setData({ geocoding: false })
          if (res.data?.status === 0) {
            const r = res.data.result
            this._enterMapStep({
              name:      r.title || addr,
              address:   r.address || addr,
              latitude:  r.location.lat,
              longitude: r.location.lng,
              country:   'CN',
            })
          } else {
            wx.showToast({ title: '地址解析失败，请尝试更详细的地址', icon: 'none' })
          }
        },
        fail: () => {
          this.setData({ geocoding: false })
          wx.showToast({ title: '网络错误', icon: 'none' })
        },
      })
    },

    /** 仅中国区无腾讯 Key 时：OSM 解析后进入地图 */
    _nominatimGeocodeAndEnter(addr, { countrycodes, region }) {
      if (region !== 'CN') return
      this.setData({ geocoding: true })
      const data = { q: addr, format: 'json', addressdetails: 1, limit: 1, 'accept-language': 'zh-CN,ko,en' }
      if (countrycodes) data.countrycodes = countrycodes
      wx.request({
        url: 'https://nominatim.openstreetmap.org/search',
        data,
        header: { 'User-Agent': 'ActivityMiniApp/1.0' },
        success: (res) => {
          this.setData({ geocoding: false })
          if (Array.isArray(res.data) && res.data.length > 0) {
            const item = res.data[0]
            this._enterMapStep({
              name:      item.display_name.split(',')[0],
              address:   item.display_name,
              latitude:  parseFloat(item.lat),
              longitude: parseFloat(item.lon),
              country:   region,
            })
          } else {
            wx.showToast({ title: '未找到该地址，请细化或换一种表述', icon: 'none' })
          }
        },
        fail: () => {
          this.setData({ geocoding: false })
          wx.showToast({ title: '网络错误', icon: 'none' })
        },
      })
    },

    _enterMapStep(loc) {
      const marker = this._makeMarker(loc.latitude, loc.longitude)
      this.setData({
        step:             'map',
        pendingLocation:  { ...loc },
        originalLocation: { ...loc },
        mapMarkers:       [marker],
        mapScale:         16,
        pinMoved:         false,
      })
    },

    _makeMarker(lat, lng) {
      return {
        id:        1,
        latitude:  lat,
        longitude: lng,
        width:     44,
        height:    44,
        callout: {
          content:      '拖拽地图点击调整位置',
          color:        '#333',
          fontSize:     12,
          borderRadius: 6,
          bgColor:      '#fff',
          padding:      6,
          display:      'ALWAYS',
        },
      }
    },

    onMapTap(e) {
      const { latitude, longitude } = e.detail
      if (!latitude || !longitude) return
      const pending = { ...this.data.pendingLocation, latitude, longitude }
      this.setData({
        pendingLocation: pending,
        mapMarkers: [this._makeMarker(latitude, longitude)],
        pinMoved: true,
      })
      this._reverseGeocode(latitude, longitude)
    },

    _reverseGeocode(lat, lng) {
      const pending = this.data.pendingLocation
      if (pending.country === 'CN' && isTencentConfigured) {
        wx.request({
          url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${lat},${lng}&key=${MAP_KEY}&get_poi=1`,
          success: (res) => {
            if (res.data?.status === 0) {
              const r = res.data.result
              const name = r.pois?.[0]?.title || r.address_component?.street_number || r.address
              this.setData({
                'pendingLocation.name':    name || this.data.pendingLocation.name,
                'pendingLocation.address': r.address || this.data.pendingLocation.address,
              })
            }
          },
        })
      }
    },

    onRegionChange() {},

    zoomIn() {
      this.setData({ mapScale: Math.min(20, this.data.mapScale + 1) })
    },

    zoomOut() {
      this.setData({ mapScale: Math.max(5, this.data.mapScale - 1) })
    },

    resetPin() {
      const orig = this.data.originalLocation
      this.setData({
        pendingLocation: { ...orig },
        mapMarkers:      [this._makeMarker(orig.latitude, orig.longitude)],
        pinMoved:        false,
      })
    },

    backToSearch() {
      this.setData({ step: 'search' })
    },

    confirmLocation() {
      const loc = this.data.pendingLocation
      this.triggerEvent('select', {
        name:      loc.name,
        address:   loc.address,
        latitude:  loc.latitude,
        longitude: loc.longitude,
        country:   loc.country || 'INTL',
      })
    },
  },
})
