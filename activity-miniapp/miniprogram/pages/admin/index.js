// pages/admin/index.js
const request = require('../../utils/request')
const { formatDate } = require('../../utils/date')
const { maskPhone, maskIdCard, maskName } = require('../../utils/crypto')

Page({
  data: {
    activeTab: 'list',
    tabs: [
      { key: 'list', label: '报名名单' },
      { key: 'analytics', label: '数据分析' },
      { key: 'reports', label: '举报管理' },
    ],
    myActivities: [],
    selectedActivityIdx: 0,
    selectedActivity: {},
    subActivities: [],
    selectedSubId: 'all',
    registrations: [],
    filteredList: [],
    searchKeyword: '',
    analytics: {
      totalRegistrations: 0,
      checkinCount: 0,
      cancelCount: 0,
      checkinRate: 0,
      fieldStats: [],
    },
    trendData: [],
    reportList: [],
  },

  onLoad(options) {
    this._loadMyActivities().then(() => {
      if (options.activityId) {
        const idx = this.data.myActivities.findIndex(a => a.id === options.activityId)
        if (idx >= 0) {
          this.setData({ selectedActivityIdx: idx, selectedActivity: this.data.myActivities[idx] })
          this._loadRegistrations()
        }
      }
      if (options.tab) {
        this.setData({ activeTab: options.tab })
      }
    })
    this._loadReports()
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    if (tab === 'analytics' && this.data.selectedActivity.id) {
      this._loadAnalytics()
    }
  },

  async _loadMyActivities() {
    try {
      const res = await request.get('/activities/my-created')
      const list = res.data || []
      this.setData({
        myActivities: list,
        selectedActivity: list[0] || {},
        selectedActivityIdx: 0,
      })
      if (list.length) this._loadRegistrations()
    } catch (e) {}
  },

  onActivityChange(e) {
    const idx = e.detail.value
    this.setData({
      selectedActivityIdx: idx,
      selectedActivity: this.data.myActivities[idx],
      selectedSubId: 'all',
    })
    this._loadRegistrations()
    this._loadSubActivities()
  },

  async _loadSubActivities() {
    const id = this.data.selectedActivity?.id
    if (!id) return
    try {
      const res = await request.get(`/activities/${id}/sub-activities`)
      this.setData({ subActivities: res.data || [] })
    } catch (e) {}
  },

  onFilterSub(e) {
    this.setData({ selectedSubId: e.currentTarget.dataset.id })
    this._applyFilter()
  },

  async _loadRegistrations() {
    const id = this.data.selectedActivity?.id
    if (!id) return
    try {
      const res = await request.get(`/admin/activities/${id}/registrations`)
      const list = (res.data || []).map(r => ({
        ...r,
        displayName: maskName(r.name || '匿名用户'),
        registrationTimeText: formatDate(r.createdAt, 'MM-DD HH:mm'),
        expandedFields: null,
      }))
      this.setData({ registrations: list })
      this._applyFilter()
    } catch (e) {}
  },

  _applyFilter() {
    let list = [...this.data.registrations]
    if (this.data.selectedSubId !== 'all') {
      list = list.filter(r => r.subActivityId === this.data.selectedSubId)
    }
    const kw = this.data.searchKeyword.trim()
    if (kw) {
      list = list.filter(r =>
        (r.name || '').includes(kw) ||
        (r.maskedPhone || '').includes(kw)
      )
    }
    this.setData({ filteredList: list })
  },

  onSearch(e) {
    this.setData({ searchKeyword: e.detail.value })
    this._applyFilter()
  },

  async revealData(e) {
    const id = e.currentTarget.dataset.id
    // 记录审计日志并返回明文
    try {
      const res = await request.post(`/admin/registrations/${id}/reveal`)
      const { data } = res
      const list = this.data.filteredList.map(r => {
        if (r.id !== id) return r
        return {
          ...r,
          displayName: data.name,
          expandedFields: Object.entries(data.customData || {}).map(([k, v]) => ({
            key: k,
            label: data.fieldLabels?.[k] || k,
            value: v,
          })),
        }
      })
      this.setData({ filteredList: list })
    } catch (e) {
      wx.showToast({ title: '查看失败', icon: 'none' })
    }
  },

  async onExportExcel() {
    wx.showModal({
      title: '安全验证',
      content: '导出操作将被记录在审计日志中，确认发送短信验证码？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await request.post('/admin/send-verify-code', { activityId: this.data.selectedActivity.id })
          wx.showModal({
            title: '输入验证码',
            editable: true,
            placeholderText: '6位验证码',
            success: async (r) => {
              if (!r.confirm) return
              wx.showLoading({ title: '生成中...' })
              try {
                const res = await request.post('/admin/export-registrations', {
                  activityId: this.data.selectedActivity.id,
                  subActivityId: this.data.selectedSubId !== 'all' ? this.data.selectedSubId : undefined,
                  code: r.content,
                })
                wx.hideLoading()
                wx.setClipboardData({ data: res.data.downloadUrl })
                wx.showToast({ title: '链接已复制', icon: 'success' })
              } catch (e) {
                wx.hideLoading()
                wx.showToast({ title: e.message || '导出失败', icon: 'none' })
              }
            },
          })
        } catch (e) {}
      },
    })
  },

  async _loadAnalytics() {
    const id = this.data.selectedActivity?.id
    if (!id) return
    try {
      const res = await request.get(`/admin/activities/${id}/analytics`)
      const data = res.data
      // 趋势数据归一化
      const max = Math.max(...(data.trend || []).map(t => t.count), 1)
      const trendData = (data.trend || []).map(t => ({
        ...t,
        heightPct: Math.round((t.count / max) * 100),
        dateLabel: t.date.slice(5),
      }))
      this.setData({ analytics: data, trendData })
    } catch (e) {}
  },

  async _loadReports() {
    try {
      const res = await request.get('/admin/reports')
      this.setData({
        reportList: (res.data || []).map(r => ({
          ...r,
          createdAtText: formatDate(r.createdAt, 'MM-DD HH:mm'),
        })),
      })
    } catch (e) {}
  },

  async onIgnoreReport(e) {
    try {
      await request.put(`/admin/reports/${e.currentTarget.dataset.id}/ignore`)
      this._loadReports()
    } catch (e) {}
  },

  async onOfflineFromReport(e) {
    wx.showModal({
      title: '下架活动',
      content: '确认下架此活动？',
      editable: true,
      placeholderText: '填写下架理由',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await request.put(`/activities/${e.currentTarget.dataset.id}/offline`, { reason: res.content })
          wx.showToast({ title: '已下架', icon: 'success' })
          this._loadReports()
        } catch (e) {}
      },
    })
  },
})
