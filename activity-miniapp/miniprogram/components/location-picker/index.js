// components/location-picker/index.js
const { MAP_KEY } = require('../../utils/config')

const LANG_CONFIG = {
  ko: { acceptLang: 'ko,zh-CN,zh,en', placeholder: '한국어로 주소를 입력하세요 (예: 강남구, 명동)', tip: '예: 강남구 · 명동 · 해운대 · 제주도 · 부산역' },
  zh: { acceptLang: 'zh-CN,zh,en',    placeholder: '输入地址关键词（如：首尔 江南区）',            tip: '例：首尔 · 釜山 · 济州岛 · 东京 · 大阪' },
  en: { acceptLang: 'en,zh-CN,zh',    placeholder: 'Enter address (e.g. Gangnam Seoul)',         tip: 'e.g. Gangnam · Myeongdong · Hongdae · Jeju' },
}

const KO_SHORTCUTS = ['강남구','명동','홍대','이태원','인사동','해운대','제주도','경복궁','부산역','인천공항','광화문','코엑스','잠실','신촌','여의도']
const FLAG_MAP = { kr:'🇰🇷', jp:'🇯🇵', us:'🇺🇸', cn:'🇨🇳', gb:'🇬🇧', fr:'🇫🇷', de:'🇩🇪', au:'🇦🇺', sg:'🇸🇬', th:'🇹🇭', vn:'🇻🇳', ph:'🇵🇭' }

Component({
  properties: {
    show: { type: Boolean, value: false },
  },

  data: {
    step: 'search',       // 'search' | 'map'
    mode: 'china',        // 'china' | 'intl'
    lang: 'ko',
    keyword: '',
    textAddress: '',      // 文字输入地址
    results: [],
    loading: false,
    geocoding: false,
    searched: false,
    koShortcuts: KO_SHORTCUTS,
    placeholder: LANG_CONFIG.ko.placeholder,
    searchTip:   LANG_CONFIG.ko.tip,

    // 地图确认状态
    pendingLocation: { name: '', address: '', latitude: 0, longitude: 0 },
    originalLocation: null,
    mapMarkers: [],
    mapScale: 16,
    pinMoved: false,
  },

  methods: {
    onClose() { this.triggerEvent('close') },

    // ── 模式 & 语言切换 ──────────────────────────
    setModeChina() { this.setData({ mode: 'china', results: [], keyword: '', textAddress: '', searched: false, step: 'search' }) },
    setModeIntl()  { this.setData({ mode: 'intl',  results: [], keyword: '', textAddress: '', searched: false, step: 'search' }) },

    _applyLang(lang) {
      const cfg = LANG_CONFIG[lang]
      this.setData({ lang, placeholder: cfg.placeholder, searchTip: cfg.tip, results: [], keyword: '', searched: false })
    },
    setLangKo() { this._applyLang('ko') },
    setLangZh() { this._applyLang('zh') },
    setLangEn() { this._applyLang('en') },

    onShortcut(e) {
      this.setData({ keyword: e.currentTarget.dataset.kw })
      this.doSearch()
    },

    // ── 文字地址输入 ──────────────────────────────
    onTextAddressInput(e) {
      this.setData({ textAddress: e.detail.value })
    },

    // 国内：腾讯地图正向地理编码
    geocodeTextAddress() {
      const addr = this.data.textAddress.trim()
      if (!addr) return wx.showToast({ title: '请输入地址', icon: 'none' })
      if (!MAP_KEY || MAP_KEY === 'YOUR_TENCENT_MAP_KEY') {
        // MAP_KEY 未配置时降级为搜索
        this.setData({ keyword: addr })
        return this.doSearchChina()
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

    // 海外：Nominatim 正向地理编码
    geocodeTextAddressIntl() {
      const addr = this.data.textAddress.trim()
      if (!addr) return wx.showToast({ title: '请输入地址', icon: 'none' })
      this.setData({ geocoding: true })
      wx.request({
        url: 'https://nominatim.openstreetmap.org/search',
        data: { q: addr, format: 'json', addressdetails: 1, limit: 1, 'accept-language': 'zh-CN,ko,en' },
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
              country:   'INTL',
            })
          } else {
            wx.showToast({ title: '未找到该地址，请换个关键词', icon: 'none' })
          }
        },
        fail: () => {
          this.setData({ geocoding: false })
          wx.showToast({ title: '网络错误', icon: 'none' })
        },
      })
    },

    // ── 国内：调腾讯地图 ──────────────────────────
    pickChina() {
      this.setData({ loading: true })
      wx.chooseLocation({
        success: (res) => {
          this.setData({ loading: false })
          this._enterMapStep({
            name:      res.name || res.address,
            address:   res.address,
            latitude:  res.latitude,
            longitude: res.longitude,
            country:   'CN',
          })
        },
        fail: (err) => {
          this.setData({ loading: false })
          if (!err.errMsg?.includes('cancel')) wx.showToast({ title: '选择地点失败', icon: 'none' })
        },
      })
    },

    // ── 海外关键词搜索 ────────────────────────────
    onKeywordInput(e) { this.setData({ keyword: e.detail.value }) },

    doSearch() {
      const { keyword, lang } = this.data
      if (!keyword.trim()) return wx.showToast({ title: lang === 'ko' ? '검색어를 입력해 주세요' : '请输入地址关键词', icon: 'none' })
      this.setData({ loading: true, results: [], searched: false })
      const cfg = LANG_CONFIG[lang]
      wx.request({
        url: 'https://nominatim.openstreetmap.org/search',
        data: { q: keyword, format: 'json', addressdetails: 1, namedetails: 1, limit: 10, 'accept-language': cfg.acceptLang },
        header: { 'User-Agent': 'ActivityMiniApp/1.0' },
        success: (res) => {
          const results = Array.isArray(res.data) ? res.data.map(item => this._formatResult(item, lang)) : []
          this.setData({ results, loading: false, searched: true })
        },
        fail: () => {
          this.setData({ loading: false, searched: true })
          wx.showToast({ title: lang === 'ko' ? '검색 실패. 네트워크를 확인해 주세요' : '搜索失败，请检查网络', icon: 'none' })
        },
      })
    },

    _formatResult(item, lang) {
      const addr  = item.address    || {}
      const names = item.namedetails || {}
      const cc    = (addr.country_code || '').toLowerCase()
      let primaryName = lang === 'ko' ? (names['name:ko'] || names['name'] || item.name || '')
                      : lang === 'zh' ? (names['name:zh'] || names['name:zh-CN'] || names['name'] || item.name || '')
                      :                 (names['name:en'] || names['name'] || item.name || '')
      const adminParts = [
        addr.quarter || addr.neighbourhood || addr.suburb,
        addr.city_district,
        addr.city || addr.town || addr.village || addr.county,
        addr.state || addr.province,
      ].filter(Boolean)
      const display = item.display_name || ''
      return {
        place_id:           item.place_id,
        primary_name:       primaryName || display.split(',')[0],
        secondary_name:     adminParts.slice(0, 2).join(' · '),
        display_name:       display.length > 60 ? display.substring(0, 57) + '...' : display,
        country_code:       cc,
        country_flag:       FLAG_MAP[cc] || '🌍',
        lat:                parseFloat(item.lat),
        lon:                parseFloat(item.lon),
        _fullDisplayName:   display,
      }
    },

    onSelectResult(e) {
      const item = this.data.results[e.currentTarget.dataset.idx]
      this._enterMapStep({
        name:      item.primary_name,
        address:   item._fullDisplayName || item.display_name,
        latitude:  item.lat,
        longitude: item.lon,
        country:   'INTL',
      })
    },

    // ── 进入地图确认步骤 ──────────────────────────
    _enterMapStep(loc) {
      const marker = this._makeMarker(loc.latitude, loc.longitude)
      this.setData({
        step:            'map',
        pendingLocation: { ...loc },
        originalLocation:{ ...loc },
        mapMarkers:      [marker],
        mapScale:        16,
        pinMoved:        false,
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
          content:   '拖拽地图点击调整位置',
          color:     '#333',
          fontSize:  12,
          borderRadius: 6,
          bgColor:   '#fff',
          padding:   6,
          display:   'ALWAYS',
        },
      }
    },

    // ── 地图操作 ──────────────────────────────────
    onMapTap(e) {
      const { latitude, longitude } = e.detail
      if (!latitude || !longitude) return
      const pending = { ...this.data.pendingLocation, latitude, longitude }
      this.setData({
        pendingLocation: pending,
        mapMarkers: [this._makeMarker(latitude, longitude)],
        pinMoved: true,
      })
      // 逆地理编码更新地址名
      this._reverseGeocode(latitude, longitude)
    },

    _reverseGeocode(lat, lng) {
      if (!MAP_KEY || MAP_KEY === 'YOUR_TENCENT_MAP_KEY') return
      // 国内用腾讯，海外跳过（Nominatim 限流较严）
      if (this.data.pendingLocation.country !== 'CN') return
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
    },

    onRegionChange() {},

    zoomIn()  { this.setData({ mapScale: Math.min(20, this.data.mapScale + 1) }) },
    zoomOut() { this.setData({ mapScale: Math.max(5,  this.data.mapScale - 1) }) },

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
