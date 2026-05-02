// pages/privacy/index.js
const i18n = require('../../utils/i18n')
const { ZH, EN } = require('./content')

Page({
  data: {
    sections: [],
    locale: 'zh',
    docTitleSub: '',
    metaLine: '',
  },

  onShow() {
    this._reload()
  },

  _reload() {
    const lang = i18n.getLanguage()
    const sections = lang === 'en' ? EN : ZH
    wx.setNavigationBarTitle({ title: lang === 'zh' ? '隐私协议' : 'Privacy Policy' })
    this.setData({
      sections,
      locale: lang,
      docTitleSub:
        lang === 'zh'
          ? '「活动报名」微信小程序 · 个人信息保护说明'
          : 'WeChat Mini Program · Personal Information',
      metaLine:
        lang === 'zh'
          ? '更新日期：2026年5月2日　生效日期：2026年5月2日'
          : 'Last updated / effective: May 2, 2026',
    })
  },
})
