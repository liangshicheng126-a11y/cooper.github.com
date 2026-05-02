// components/location-picker/index.js
const { MAP_KEY, GOOGLE_MAPS_KEY } = require('../../utils/config')

const isTencentConfigured = MAP_KEY && MAP_KEY !== 'YOUR_TENCENT_MAP_KEY'
const isGoogleConfigured = GOOGLE_MAPS_KEY && GOOGLE_MAPS_KEY !== 'YOUR_GOOGLE_MAPS_KEY'

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
    /** 海外 + 已配 Google Key：用 Static API 图替代 <map>（<map> 在微信内固定为腾讯底图） */
    showGoogleStaticMap: false,
    googleStaticMapUrl: '',
  },

  methods: {
    /** 阻止点击/手势穿透到外层面板或滚动穿透底页（占位即可） */
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

    geocodeTextAddressIntl() {
      const addr = this.data.textAddress.trim()
      if (!addr) return wx.showToast({ title: '请输入地址', icon: 'none' })
      if (isGoogleConfigured) {
        return this._googleForwardGeocodeAndEnter(addr)
      }
      return this._nominatimGeocodeAndEnter(addr, { region: 'INTL' })
    },

    /** 海外正向地理编码（Google Maps Geocoding API） */
    _googleForwardGeocodeAndEnter(addr) {
      this.setData({ geocoding: true })
      wx.request({
        url: 'https://maps.googleapis.com/maps/api/geocode/json',
        data: { address: addr, key: GOOGLE_MAPS_KEY, language: 'zh-CN' },
        success: (res) => {
          const body = res.data || {}
          if (body.status === 'OK' && body.results?.length) {
            const loc = this._locFromGoogleGeocode(body.results[0], addr)
            this.setData({ geocoding: false })
            if (loc) this._enterMapStep(loc)
            return
          }
          this.setData({ geocoding: false })
          if (body.status === 'ZERO_RESULTS') {
            wx.showToast({ title: '未找到该地址，试试更完整写法', icon: 'none' })
            return
          }
          const msg = (body.error_message || 'Google Geocoding 解析失败').slice(0, 28)
          wx.showToast({ title: msg, icon: 'none' })
        },
        fail: () => {
          this.setData({ geocoding: false })
          wx.showToast({ title: '网络错误', icon: 'none' })
        },
      })
    },

    _locFromGoogleGeocode(result, fallbackAddr) {
      const loc = result?.geometry?.location
      if (loc == null || loc.lat == null || loc.lng == null) return null
      const formatted = result.formatted_address || fallbackAddr
      const primary = formatted.split(',')[0]?.trim() || fallbackAddr
      return {
        name:      primary,
        address:   formatted,
        latitude:  typeof loc.lat === 'function' ? loc.lat() : Number(loc.lat),
        longitude: typeof loc.lng === 'function' ? loc.lng() : Number(loc.lng),
        country:   'INTL',
      }
    },

    /** 境内无腾讯 Key 时用 OSM；海外在未配置 Google Key 时用 OSM 兜底 */
    _nominatimGeocodeAndEnter(addr, { countrycodes, region }) {
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

    _buildGoogleStaticMapUrl(lat, lng, zoom) {
      if (!isGoogleConfigured) return ''
      const z = Math.max(5, Math.min(20, Math.round(zoom || this.data.mapScale || 16)))
      const latn = Number(lat)
      const lngn = Number(lng)
      if (Number.isNaN(latn) || Number.isNaN(lngn)) return ''
      const mk = encodeURIComponent(`color:red|${latn},${lngn}`)
      return `https://maps.googleapis.com/maps/api/staticmap?center=${latn},${lngn}&zoom=${z}&size=640x640&scale=2&markers=${mk}&key=${encodeURIComponent(GOOGLE_MAPS_KEY)}`
    },

    _enterMapStep(loc) {
      const marker = this._makeMarker(loc.latitude, loc.longitude)
      const showGoogleStaticMap = Boolean(
        loc.country && loc.country !== 'CN' && isGoogleConfigured,
      )
      const googleStaticMapUrl = showGoogleStaticMap
        ? this._buildGoogleStaticMapUrl(loc.latitude, loc.longitude, 16)
        : ''
      this.setData({
        step:             'map',
        pendingLocation:  { ...loc },
        originalLocation: { ...loc },
        mapMarkers:       [marker],
        mapScale:         16,
        pinMoved:         false,
        showGoogleStaticMap,
        googleStaticMapUrl,
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
      if (this.data.showGoogleStaticMap) return
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
        return
      }
      if (pending.country !== 'CN' && isGoogleConfigured) {
        wx.request({
          url: 'https://maps.googleapis.com/maps/api/geocode/json',
          data: { latlng: `${lat},${lng}`, key: GOOGLE_MAPS_KEY, language: 'zh-CN' },
          success: (res) => {
            if (res.data?.status !== 'OK' || !res.data.results?.length) return
            const formatted = res.data.results[0].formatted_address
            const name = formatted.split(',')[0]?.trim() || formatted
            this.setData({
              'pendingLocation.name':    name,
              'pendingLocation.address': formatted,
            })
          },
        })
      }
    },

    onRegionChange() {},

    zoomIn() {
      const ns = Math.min(20, this.data.mapScale + 1)
      const patch = { mapScale: ns }
      if (this.data.showGoogleStaticMap) {
        patch.googleStaticMapUrl = this._buildGoogleStaticMapUrl(
          this.data.pendingLocation.latitude,
          this.data.pendingLocation.longitude,
          ns,
        )
      }
      this.setData(patch)
    },

    zoomOut() {
      const ns = Math.max(5, this.data.mapScale - 1)
      const patch = { mapScale: ns }
      if (this.data.showGoogleStaticMap) {
        patch.googleStaticMapUrl = this._buildGoogleStaticMapUrl(
          this.data.pendingLocation.latitude,
          this.data.pendingLocation.longitude,
          ns,
        )
      }
      this.setData(patch)
    },

    resetPin() {
      const orig = this.data.originalLocation
      const patch = {
        pendingLocation: { ...orig },
        mapMarkers:      [this._makeMarker(orig.latitude, orig.longitude)],
        pinMoved:        false,
      }
      if (this.data.showGoogleStaticMap && orig) {
        patch.googleStaticMapUrl = this._buildGoogleStaticMapUrl(
          orig.latitude,
          orig.longitude,
          this.data.mapScale,
        )
      }
      this.setData(patch)
    },

    onGoogleStaticImageError() {
      wx.showToast({
        title: '图示加载失败：启用 Maps Static API，并添加 downloadFile 域名',
        icon: 'none',
        duration: 3800,
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
