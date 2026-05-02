// components/location-picker/index.js
const LANG_CONFIG = {
  ko: {
    acceptLang: 'ko,zh-CN,zh,en',
    placeholder: '한국어로 주소를 입력하세요 (예: 강남구, 명동)',
    tip: '예: 강남구 · 명동 · 해운대 · 제주도 · 부산역',
  },
  zh: {
    acceptLang: 'zh-CN,zh,en',
    placeholder: '输入地址关键词（如：首尔 江南区）',
    tip: '例：首尔 · 釜山 · 济州岛 · 东京 · 大阪',
  },
  en: {
    acceptLang: 'en,zh-CN,zh',
    placeholder: 'Enter address (e.g. Gangnam Seoul)',
    tip: 'e.g. Gangnam · Myeongdong · Hongdae · Jeju',
  },
}

const KO_SHORTCUTS = [
  '강남구', '명동', '홍대', '이태원', '인사동',
  '해운대', '제주도', '경복궁', '부산역', '인천공항',
  '광화문', '코엑스', '잠실', '신촌', '여의도',
]

// 国旗 emoji 映射
const FLAG_MAP = {
  kr: '🇰🇷', jp: '🇯🇵', us: '🇺🇸', cn: '🇨🇳',
  gb: '🇬🇧', fr: '🇫🇷', de: '🇩🇪', au: '🇦🇺',
  sg: '🇸🇬', th: '🇹🇭', vn: '🇻🇳', ph: '🇵🇭',
}

Component({
  properties: {
    show: { type: Boolean, value: false },
  },

  data: {
    mode: 'china',
    lang: 'ko',              // 默认韩语
    keyword: '',
    results: [],
    loading: false,
    searched: false,
    koShortcuts: KO_SHORTCUTS,
    placeholder: LANG_CONFIG.ko.placeholder,
    searchTip:   LANG_CONFIG.ko.tip,
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

    // ── 语言切换 ──────────────────────────────────
    _applyLang(lang) {
      const cfg = LANG_CONFIG[lang]
      this.setData({
        lang,
        placeholder: cfg.placeholder,
        searchTip:   cfg.tip,
        results: [],
        keyword: '',
        searched: false,
      })
    },
    setLangKo() { this._applyLang('ko') },
    setLangZh() { this._applyLang('zh') },
    setLangEn() { this._applyLang('en') },

    // ── 快捷城市按钮 ──────────────────────────────
    onShortcut(e) {
      const kw = e.currentTarget.dataset.kw
      this.setData({ keyword: kw })
      this.doSearch()
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

    onKeywordInput(e) {
      this.setData({ keyword: e.detail.value })
    },

    // ── 海外 Nominatim 搜索 ───────────────────────
    doSearch() {
      const { keyword, lang } = this.data
      if (!keyword.trim()) {
        const msg = lang === 'ko' ? '검색어를 입력해 주세요' : '请输入地址关键词'
        return wx.showToast({ title: msg, icon: 'none' })
      }

      this.setData({ loading: true, results: [], searched: false })
      const cfg = LANG_CONFIG[lang]

      wx.request({
        url: 'https://nominatim.openstreetmap.org/search',
        data: {
          q:              keyword,
          format:         'json',
          addressdetails: 1,
          namedetails:    1,     // 返回多语言名称（含 name:ko）
          limit:          10,
          'accept-language': cfg.acceptLang,
        },
        header: {
          'User-Agent':  'ActivityMiniApp/1.0',
          'Referer':     'https://activity-miniapp.example.com',
        },
        success: (res) => {
          if (!Array.isArray(res.data)) {
            this.setData({ loading: false, searched: true })
            return
          }
          const results = res.data.map(item => this._formatResult(item, lang))
          this.setData({ results, loading: false, searched: true })
        },
        fail: () => {
          this.setData({ loading: false, searched: true })
          const msg = lang === 'ko' ? '검색 실패. 네트워크를 확인해 주세요' : '搜索失败，请检查网络'
          wx.showToast({ title: msg, icon: 'none' })
        },
      })
    },

    // ── 结果格式化（提取语言优先名称） ────────────
    _formatResult(item, lang) {
      const addr    = item.address    || {}
      const names   = item.namedetails || {}
      const cc      = (addr.country_code || '').toLowerCase()

      // 按语言优先级取名称
      let primaryName = ''
      if (lang === 'ko') {
        primaryName = names['name:ko'] || names['name'] || item.name || ''
      } else if (lang === 'zh') {
        primaryName = names['name:zh'] || names['name:zh-CN'] || names['name'] || item.name || ''
      } else {
        primaryName = names['name:en'] || names['name'] || item.name || ''
      }

      // 副标题：行政区 + 城市
      const adminParts = [
        addr['name'] !== primaryName ? addr['name'] : null,
        addr.quarter || addr.neighbourhood || addr.suburb,
        addr.city_district,
        addr.city || addr.town || addr.village || addr.county,
        addr.state || addr.province,
      ].filter(Boolean)

      // 最后一行：完整地址
      const displayName = item.display_name || ''

      return {
        place_id:       item.place_id,
        primary_name:   primaryName || displayName.split(',')[0],
        secondary_name: adminParts.slice(0, 2).join(' · '),
        display_name:   displayName.length > 60
          ? displayName.substring(0, 57) + '...'
          : displayName,
        country_code:   cc,
        country_flag:   FLAG_MAP[cc] || '🌍',
        lat:            parseFloat(item.lat),
        lon:            parseFloat(item.lon),
      }
    },

    onSelectResult(e) {
      const idx  = e.currentTarget.dataset.idx
      const item = this.data.results[idx]
      this.triggerEvent('select', {
        name:      item.primary_name,
        address:   item.display_name,
        latitude:  item.lat,
        longitude: item.lon,
        country:   'INTL',
      })
    },
  },
})
