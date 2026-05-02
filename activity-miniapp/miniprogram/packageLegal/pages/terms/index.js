// pages/terms/index.js
const i18n = require('../../../utils/i18n')
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
    wx.setNavigationBarTitle({ title: lang === 'zh' ? '用户服务条款' : 'Terms of Service' })
    this.setData({
      sections,
      locale: lang,
      docTitleSub:
        lang === 'zh'
          ? '「活动报名」微信小程序'
          : 'Activity Registration Mini Program',
      metaLine:
        lang === 'zh'
          ? '更新日期：2026年5月2日　生效日期：2026年5月2日'
          : 'Last updated / effective: May 2, 2026',
    })
  },
})
