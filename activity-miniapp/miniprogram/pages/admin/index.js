// pages/admin/index.js
const request = require('../../utils/request')
const { formatDate } = require('../../utils/date')
const { maskPhone, maskIdCard, maskName } = require('../../utils/crypto')

Page({
  data: {
    activeTab: 'list',
    tabs: [
      { key: 'list', label: '报名名单' },
      { key: 'roster', label: '学生名册' },
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
    rosterChoices: [{ id: '', title: '— 不对照名册 —' }],
    rosterPickIdx: 0,
    rosterIdForCheck: '',
    rosterCheckById: {},
    rosterMatchSummary: '',
    newRosterTitle: '本校学生名册',
    rosters: [],
    rosterStudentPreview: [],
    rosterPreviewTotal: 0,
  },

  onLoad(options) {
    this._loadReports()
    this._bootstrapAdmin(options)
  },

  async _bootstrapAdmin(options) {
    await this._loadMyActivities()
    if (options.activityId) {
      const idx = this.data.myActivities.findIndex(a => a.id === options.activityId)
      if (idx >= 0) {
        this.setData({
          selectedActivityIdx: idx,
          selectedActivity: this.data.myActivities[idx],
        })
        await this._loadRegistrations()
      }
    }
    if (options.tab) this.setData({ activeTab: options.tab })
    await this._loadSubActivities()
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    if (tab === 'analytics' && this.data.selectedActivity.id) {
      this._loadAnalytics()
    }
    if (tab === 'roster') {
      this._loadRosters()
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
      await this._loadRosters()
      if (list.length) await this._loadRegistrations()
      else await this._refreshRosterCheck()
    } catch (e) {}
  },

  onActivityChange(e) {
    const idx = e.detail.value
    this.setData({
      selectedActivityIdx: idx,
      selectedActivity: this.data.myActivities[idx],
      selectedSubId: 'all',
    })
    this._loadSubActivities()
    this._loadRegistrations()
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
        displayName: maskName(r.nickname || '用户'),
        registrationTimeText: formatDate(r.createdAt, 'MM-DD HH:mm'),
        expandedFields: null,
      }))
      this.setData({ registrations: list })
      await this._refreshRosterCheck()
    } catch (e) {}
  },

  /** 名册与报名表对照（在活动侧选择名册后触发） */
  async _refreshRosterCheck() {
    const actId = this.data.selectedActivity?.id
    const rid = this.data.rosterIdForCheck
    if (!actId || !rid) {
      this.setData({ rosterCheckById: {}, rosterMatchSummary: '' })
      this._applyFilter()
      return
    }
    try {
      const res = await request.get(`/admin/activities/${actId}/roster-check`, { rosterId: rid })
      const d = res.data || {}
      const m = {}
      ;(d.results || []).forEach((x) => {
        m[x.registrationId] = { matched: x.matched, matchBy: x.matchBy || '' }
      })
      const summary =
        typeof d.matchedCount === 'number'
          ? `名册匹配 ${d.matchedCount} / ${d.total || d.results?.length || 0}`
          : ''
      this.setData({ rosterCheckById: m, rosterMatchSummary: summary })
    } catch (e) {
      this.setData({ rosterCheckById: {}, rosterMatchSummary: '' })
    }
    this._applyFilter()
  },

  _applyFilter() {
    let list = [...this.data.registrations]
    if (this.data.selectedSubId !== 'all') {
      list = list.filter(r => r.subActivityId === this.data.selectedSubId)
    }
    const kw = this.data.searchKeyword.trim()
    if (kw) {
      list = list.filter(r =>
        (r.displayName || '').includes(kw) ||
        (r.nickname || '').includes(kw))
    }
    const chkOn = !!this.data.rosterIdForCheck
    const chk = this.data.rosterCheckById || {}
    list = list.map((r) => {
      let rosterCheckLabel = ''
      if (chkOn) {
        const row = chk[r.id]
        if (row?.matched) {
          if (row.matchBy === 'phone') rosterCheckLabel = '名册·手机匹配'
          else if (row.matchBy === 'student_no') rosterCheckLabel = '名册·学号匹配'
          else rosterCheckLabel = '名册·已匹配'
        } else {
          rosterCheckLabel = '名册·未命中'
        }
      }
      return { ...r, rosterCheckLabel }
    })
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
      const data = res.data || {}
      const cd = data.customData || {}
      const nameFromFields = [
        cd.name,
        cd.realName,
        cd.real_name,
        cd.姓名,
        cd.trueName,
        cd.studentName,
        cd.xm,
      ].find((x) => typeof x === 'string' && String(x).trim())

      const list = this.data.filteredList.map(r => {
        if (r.id !== id) return r
        return {
          ...r,
          displayName: (nameFromFields && String(nameFromFields).trim()) || r.nickname || '用户',
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

  /** —— 学生名册 Excel —— */
  onRosterTitleInput(e) {
    this.setData({ newRosterTitle: e.detail.value })
  },

  async _loadRosters() {
    try {
      const res = await request.get('/admin/rosters')
      const arr = res.data || []
      const rosterChoices = [
        { id: '', title: '— 不对照名册 —' },
        ...arr.map(r => ({
          id: String(r.id),
          title: `${r.title}（${r.rowSuccess ?? 0}人）`,
        })),
      ]
      let idx = rosterChoices.findIndex(x => String(x.id) === String(this.data.rosterIdForCheck))
      if (idx < 0) idx = 0
      const newRid = rosterChoices[idx].id
      this.setData({
        rosters: arr,
        rosterChoices,
        rosterPickIdx: idx,
        rosterIdForCheck: newRid,
      })
      await this._refreshRosterCheck()
    } catch (e) {
      this.setData({
        rosters: [],
        rosterChoices: [{ id: '', title: '— 不对照名册 —' }],
        rosterPickIdx: 0,
        rosterIdForCheck: '',
      })
    }
  },

  tapImportRosterExcel() {
    const titleTrim = (this.data.newRosterTitle || '').trim() || '学生名册'
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['xlsx', 'xls'],
      success: async (res) => {
        const tf = res.tempFiles[0]
        if (!tf) return
        wx.showLoading({ title: '上传解析中...' })
        try {
          const body = await request.upload('/admin/rosters/import', tf.path, 'file', {
            title: titleTrim.slice(0, 200),
          })
          wx.hideLoading()
          if (!body || body.code !== 0) {
            wx.showToast({
              title: (body && body.message) || '导入失败',
              icon: 'none',
            })
            return
          }
          const ok = body.data?.rowSuccess ?? 0
          const fail = body.data?.rowFailed ?? 0
          wx.showModal({
            title: '导入完成',
            content: `成功 ${ok} 条${fail ? `，未写入 ${fail} 条（见失败原因摘要）` : ''}`,
            showCancel: false,
          })
          await this._loadRosters()
        } catch (err) {
          wx.hideLoading()
          wx.showToast({ title: '上传失败', icon: 'none' })
        }
      },
    })
  },

  async onRosterForCheckChange(e) {
    const idx = parseInt(e.detail.value, 10) || 0
    const item = this.data.rosterChoices[idx]
    this.setData({
      rosterPickIdx: idx,
      rosterIdForCheck: item && item.id !== undefined ? item.id : '',
    })
    await this._refreshRosterCheck()
  },

  tapDeleteRoster(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除名册',
      content: '将删除整张名册及所含学生记录，确认？',
      success: async (r) => {
        if (!r.confirm) return
        try {
          await request.delete(`/admin/rosters/${id}`)
          wx.showToast({ title: '已删除', icon: 'success' })
          if (String(this.data.rosterIdForCheck) === String(id)) {
            this.setData({ rosterIdForCheck: '', rosterPickIdx: 0 })
          }
          await this._loadRosters()
          this.setData({ rosterStudentPreview: [], rosterPreviewTotal: 0 })
        } catch (err) {}
      },
    })
  },

  async tapPreviewRoster(e) {
    const id = e.currentTarget.dataset.id
    wx.showLoading({ title: '加载...' })
    try {
      const res = await request.get(`/admin/rosters/${id}/students`, { page: 1, size: 100 })
      const d = res.data || {}
      this.setData({
        rosterStudentPreview: d.list || [],
        rosterPreviewTotal: d.total || 0,
      })
    } catch (err) {}
    wx.hideLoading()
  },
})
