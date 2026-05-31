// pages/activity-detail/index.js
const request = require('../../utils/request')
const { getMenuButtonAnchor } = require('../../utils/nav')
const { formatDate, getDurationNatural, getActivityStatus } = require('../../utils/date')
const { getStatusMeta, getProgressMeta } = require('../../utils/activityStatus')
const { withActivityMedia, resolveAvatarUrl } = require('../../utils/media')

const CAT_LABEL = {
  sport: '运动', culture: '文化', volunteer: '公益', social: '社交', other: '其他',
}

Page({
  data: {
    activityId: null,
    activity: {},
    subActivities: [],
    selectedSubId: null,
    registrantSlots: [],
    isRegistered: false,
    isCreator: false,
    showInviteCode: false,
    userRegistrationId: null,
    statusKey: '',
    statusText: '',
    statusClass: '',
    startTimeText: '',
    scheduleStartFull: '',
    scheduleEndFull: '',
    scheduleDurationNatural: '',
    categoryLabel: '活动',
    progressPct: 0,
    progressClass: '',
    descExpanded: false,
    cannotRegister: false,
    showConflictModal: false,
    conflictActivity: '',
    pendingRegisterParams: null,
    loadError: false,
    loading: true,
    navBackTop: 48,
    navBackHeight: 32,
    wxGroupHighlight: false,
    hasWxGroupQr: false,
    wxGroupVisible: false,
    coverFailed: false,
  },

  onLoad(options) {
    const anchor = getMenuButtonAnchor()
    this.setData({
      navBackTop: anchor.top,
      navBackHeight: anchor.height,
      wxGroupHighlight: options.fromRegister === '1',
    })

    const id = options.id
    if (!id) {
      this.setData({ loading: false, loadError: true })
      return
    }
    this.setData({ activityId: id })
    this._loadDetail(id)
  },

  async _loadDetail(id) {
    this.setData({ coverFailed: false })
    wx.showNavigationBarLoading()
    try {
      const [actRes, subRes, regRes] = await Promise.all([
        request.get(`/activities/${id}`),
        request.get(`/activities/${id}/sub-activities`),
        request.get(`/activities/${id}/my-registration`),
      ])

      const activity = withActivityMedia(actRes.data)
      if (!activity || !activity.id) {
        this.setData({ loading: false, loadError: true })
        return
      }

      const status = getActivityStatus(activity)
      const statusMeta = getStatusMeta(status, 'badge')
      const progress = getProgressMeta(activity, 'danger', '', '')
      const app = getApp()

      const subActivities = (subRes.data || []).map(s => ({
        ...s,
        startTimeText: formatDate(s.startTime, 'MM/DD HH:mm'),
        endTimeText: formatDate(s.endTime, 'HH:mm'),
        isFull: s.maxParticipants > 0 && s.registrationCount >= s.maxParticipants,
      }))

      const defaultSubId = subActivities.length > 0
        ? (subActivities.find(s => !s.isFull)?.id || null)
        : null

      const scheduleStartFull = formatDate(activity.startTime, 'YYYY年MM月DD日 HH:mm')
      const scheduleEndFull = formatDate(activity.endTime, 'YYYY年MM月DD日 HH:mm')
      const scheduleDurationNatural = getDurationNatural(activity.startTime, activity.endTime)
      const categoryLabel = CAT_LABEL[activity.category] || CAT_LABEL.other

      let activityForView = activity
      if (activity.creatorOpenid === app.globalData.openid) {
        const list = Array.isArray(activity.recentCheckins) ? activity.recentCheckins : []
        activityForView = {
          ...activity,
          checkinCount: activity.checkinCount ?? 0,
          recentCheckins: list.map((r) => ({
            ...r,
            checkinTimeText: formatDate(r.checkinTime, 'YYYY-MM-DD HH:mm:ss'),
          })),
        }
      }

      const qrUrl = activityForView.wxGroupChatQrcodeUrl ? String(activityForView.wxGroupChatQrcodeUrl).trim() : ''
      const hasWxGroupQr = !!qrUrl
      const loggedInOid = app.globalData.openid || ''
      const wxGroupVisible = hasWxGroupQr && (!!regRes.data || activityForView.creatorOpenid === loggedInOid)

      this.setData({
        activity: activityForView,
        subActivities,
        selectedSubId: regRes.data?.subActivityId || defaultSubId,
        registrantSlots: this._buildRegistrantSlots(activityForView),
        isRegistered: !!regRes.data,
        userRegistrationId: regRes.data?.id || null,
        isCreator: activityForView.creatorOpenid === app.globalData.openid,
        hasWxGroupQr,
        wxGroupVisible,
        statusKey: status,
        statusText: statusMeta.text,
        statusClass: statusMeta.className,
        startTimeText: scheduleStartFull,
        scheduleStartFull,
        scheduleEndFull,
        scheduleDurationNatural,
        categoryLabel,
        progressPct: progress.percent,
        progressClass: progress.className,
        cannotRegister: ['ended', 'full', 'cancelled', 'offline'].includes(status),
        loading: false,
      })
      wx.setNavigationBarTitle({ title: activityForView.name })

      const shouldScrollWx = this.data.wxGroupHighlight && hasWxGroupQr && wxGroupVisible
      if (shouldScrollWx) {
        wx.nextTick(() => this._scrollToWxGroup())
      }
    } catch (e) {
      console.error('[activity-detail] 加载失败:', e)
      wx.showToast({ title: e.message || '加载失败', icon: 'none' })
      this.setData({ loadError: true, loading: false })
    } finally {
      wx.hideNavigationBarLoading()
    }
  },

  onShow() {
    if (!this.data.activityId || this.data.loading || this.data.loadError) return
    if (this.data.isCreator) {
      this._loadDetail(this.data.activityId)
    }
  },

  onCoverError() {
    this.setData({ coverFailed: true })
  },

  onRegAvatarError(e) {
    const idx = e.currentTarget.dataset.index
    if (idx === undefined) return
    this.setData({ [`registrantSlots[${idx}].avatarUrl`]: '' })
  },

  onRetry() {
    this.setData({ loadError: false })
    this._loadDetail(this.data.activityId)
  },

  _scrollToWxGroup() {
    wx.createSelectorQuery()
      .in(this)
      .select('#wx-group-card')
      .boundingClientRect()
      .selectViewport()
      .scrollOffset()
      .exec((res) => {
        const rect = res[0]
        const scroll = res[1]
        if (rect && scroll) {
          wx.pageScrollTo({
            scrollTop: scroll.scrollTop + rect.top - 120,
            duration: 280,
          })
        }
      })
  },

  _buildRegistrantSlots(activity) {
    const raw = activity.recentRegistrants || []
    const rc = Math.max(0, Number(activity.registrationCount) || 0)
    const maxShow = Math.min(rc, 8)
    const slots = []
    const n = Math.min(raw.length, maxShow)
    for (let i = 0; i < n; i++) {
      const r = raw[i] || {}
      slots.push({
        key: `a${i}`,
        avatarUrl: resolveAvatarUrl(r.avatarUrl || r.avatar_url),
      })
    }
    while (slots.length < maxShow) {
      slots.push({
        key: `p${slots.length}`,
        avatarUrl: '',
      })
    }
    return slots
  },

  onSelectSub(e) {
    const id = e.currentTarget.dataset.id
    const sub = this.data.subActivities.find(s => s.id === id)
    if (sub?.isFull) {
      wx.showToast({ title: '该场次已报满', icon: 'none' })
      return
    }
    this.setData({ selectedSubId: id })
  },

  async onRegister() {
    const { subActivities, selectedSubId, activityId } = this.data
    if (subActivities.length > 0 && !selectedSubId) {
      wx.showToast({ title: '请先选择场次', icon: 'none' })
      return
    }
    const app = getApp()
    if (!app.globalData.token) {
      await app.wxLogin()
    }

    // 检查时间冲突
    try {
      const conflictRes = await request.get('/registrations/check-conflict', {
        subActivityId: selectedSubId,
        activityId,
      })
      if (conflictRes.data?.hasConflict) {
        this.setData({
          showConflictModal: true,
          conflictActivity: conflictRes.data.conflictName,
          pendingRegisterParams: { activityId, subActivityId: selectedSubId, forceRegister: false },
        })
        return
      }
    } catch (e) {}

    // 有自定义字段，跳转报名页
    const { activity } = this.data
    if (activity.customFields?.length) {
      wx.navigateTo({
        url: `/pages/register/index?activityId=${activityId}&subId=${selectedSubId || ''}`,
      })
    } else {
      this._submitRegistration({ activityId, subActivityId: selectedSubId, forceRegister: false })
    }
  },

  async _submitRegistration(params) {
    wx.showLoading({ title: '报名中...' })
    try {
      await request.post('/registrations', params)
      this.setData({ isRegistered: true })
      wx.showToast({ title: '报名成功 🎉', icon: 'success' })
      // 请求订阅消息权限
      this._requestSubscribeMessage()
      this._loadDetail(this.data.activityId)
    } catch (e) {
      wx.showToast({ title: e.message || '报名失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  forceRegister() {
    const params = { ...this.data.pendingRegisterParams, forceRegister: true }
    this.setData({ showConflictModal: false })
    this._submitRegistration(params)
  },

  cancelConflict() {
    this.setData({ showConflictModal: false })
  },

  async onCancelRegistration() {
    const res = await new Promise(r => wx.showModal({
      title: '确认取消',
      content: '确定要取消报名吗？',
      success: r,
    }))
    if (!res.confirm) return
    wx.showLoading({ title: '取消中...' })
    try {
      await request.delete(`/registrations/${this.data.userRegistrationId}`)
      this.setData({ isRegistered: false, userRegistrationId: null })
      wx.showToast({ title: '已取消报名', icon: 'success' })
      this._loadDetail(this.data.activityId)
    } catch (e) {
      wx.showToast({ title: '取消失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  toggleInviteCode() {
    this.setData({ showInviteCode: !this.data.showInviteCode })
  },

  copyInviteCode() {
    const code = this.data.activity.inviteCode
    if (!code) return
    wx.setClipboardData({
      data: code,
      success: () => wx.showToast({ title: '邀请码已复制', icon: 'success' }),
    })
  },

  onCopyLocation() {
    const { activity } = this.data
    const parts = [activity.locationName, activity.locationAddress].filter((s) => s && String(s).trim())
    if (!parts.length) return
    wx.setClipboardData({
      data: parts.join('\n'),
      success: () => wx.showToast({ title: '地址已复制', icon: 'success' }),
    })
  },

  onViewRegistrations() {
    wx.navigateTo({ url: `/pages/admin/index?activityId=${this.data.activityId}&tab=list` })
  },

  async onExportExcel() {
    wx.showModal({
      title: '安全验证',
      content: '导出完整名单需要短信验证码验证，确认发送？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await request.post('/admin/send-verify-code', { activityId: this.data.activityId })
          wx.showModal({
            title: '请输入验证码',
            editable: true,
            placeholderText: '6位验证码',
            success: async (r) => {
              if (!r.confirm || !r.content) return
              wx.showLoading({ title: '生成中...' })
              try {
                const res = await request.post('/admin/export-registrations', {
                  activityId: this.data.activityId,
                  code: r.content,
                })
                wx.hideLoading()
                wx.showModal({
                  title: '导出成功',
                  content: `下载链接已生成，有效期30分钟`,
                  confirmText: '复制链接',
                  success: (m) => {
                    if (m.confirm) wx.setClipboardData({ data: res.data.downloadUrl })
                  },
                })
              } catch (e) {
                wx.hideLoading()
                wx.showToast({ title: e.message || '导出失败', icon: 'none' })
              }
            },
          })
        } catch (e) {
          wx.showToast({ title: '发送失败', icon: 'none' })
        }
      },
    })
  },

  onCopyAnnouncement() {
    const { activity } = this.data
    const locLine = [activity.locationName, activity.locationAddress].filter((s) => s && String(s).trim()).join(' ')
    const text = `【活动通知】
📌 ${activity.name}
📅 时间：${this.data.startTimeText}
${locLine ? `📍 地点：${locLine}\n` : ''}👥 名额：${activity.maxParticipants > 0 ? `${activity.registrationCount}/${activity.maxParticipants}人` : `${activity.registrationCount}人已报名（不限）`}
${activity.reminder ? `💡 ${activity.reminder}\n` : ''}
点击小程序报名 ↓`
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '已复制群公告', icon: 'success' }),
    })
  },

  onGeneratePoster() {
    wx.navigateTo({ url: `/pages/poster/index?activityId=${this.data.activityId}` })
  },

  /** 发布者：出示核验码 + 签到名单 */
  onCheckinQR() {
    wx.navigateTo({ url: `/pages/checkin/index?activityId=${this.data.activityId}&mode=admin` })
  },

  /** 报名者：跳转扫码签到（扫主办方核验码） */
  onRegistrantCheckin() {
    wx.navigateTo({ url: `/pages/checkin/index?activityId=${this.data.activityId}&mode=user` })
  },

  async onShareQR() {
    wx.showLoading({ title: '生成中...' })
    try {
      const res = await request.get(`/activities/${this.data.activityId}/qrcode`)
      wx.hideLoading()
      wx.previewImage({ urls: [res.data.qrcodeUrl] })
    } catch (e) {
      wx.hideLoading()
    }
  },

  async onNotifyAll() {
    const { activity } = this.data
    wx.showModal({
      title: '通知所有报名者',
      content: `将向 ${activity.registrationCount} 位报名者发送通知，请确认`,
      editable: true,
      placeholderText: '输入通知内容（可选）',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await request.post(`/activities/${this.data.activityId}/notify-all`, {
            message: res.content,
          })
          wx.showToast({ title: '通知已发送', icon: 'success' })
        } catch (e) {
          wx.showToast({ title: '发送失败', icon: 'none' })
        }
      },
    })
  },

  async onOfflineActivity() {
    wx.showModal({
      title: '下架活动',
      content: '下架后所有用户将无法看到此活动，确认下架？',
      editable: true,
      placeholderText: '填写下架理由',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await request.put(`/activities/${this.data.activityId}/offline`, { reason: res.content })
          wx.showToast({ title: '已下架', icon: 'success' })
          wx.navigateBack()
        } catch (e) {}
      },
    })
  },

  onEditActivity() {
    wx.navigateTo({ url: `/pages/create-activity/index?id=${this.data.activityId}` })
  },

  goWxGroupSetup() {
    wx.navigateTo({ url: `/pages/wx-group-setup/index?id=${this.data.activityId}` })
  },

  async onReport() {
    wx.showActionSheet({
      itemList: ['涉嫌诈骗', '色情低俗', '违法违规', '虚假信息', '其他'],
      success: async (res) => {
        try {
          await request.post('/activities/report', {
            activityId: this.data.activityId,
            reason: ['涉嫌诈骗', '色情低俗', '违法违规', '虚假信息', '其他'][res.tapIndex],
          })
          wx.showToast({ title: '举报已提交，感谢反馈', icon: 'success' })
        } catch (e) {}
      },
    })
  },

  _requestSubscribeMessage() {
    const { SUBSCRIBE_TEMPLATES } = require('../../utils/config')
    wx.requestSubscribeMessage({
      // ⚠️ 替换为你在微信公众平台申请的订阅消息模板 ID
      tmplIds: [SUBSCRIBE_TEMPLATES.REMIND_24H, SUBSCRIBE_TEMPLATES.REMIND_1H],
      fail: () => {},
    })
  },

  toggleDesc() {
    this.setData({ descExpanded: !this.data.descExpanded })
  },

  goBack() {
    wx.navigateBack()
  },

  onShareAppMessage() {
    const { activity, activityId, startTimeText } = this.data
    const title = activity.name
      ? `${activity.name}${startTimeText ? ' · ' + startTimeText : ''}`
      : '来参加这个活动吧！'
    return {
      title,
      path: `/pages/activity-detail/index?id=${activityId}`,
      imageUrl: activity.coverImage || '',
      promise: new Promise(resolve => {
        resolve({
          title,
          path: `/pages/activity-detail/index?id=${activityId}`,
          imageUrl: activity.coverImage || '',
        })
      }),
    }
  },

  onShareTimeline() {
    const { activity, activityId, startTimeText } = this.data
    return {
      title: activity.name
        ? `${activity.name}${startTimeText ? ' · ' + startTimeText : ''}`
        : '来参加这个活动吧！',
      query: `id=${activityId}`,
      imageUrl: activity.coverImage || '',
    }
  },

  onCopyLink() {
    const { activity, scheduleStartFull, scheduleEndFull } = this.data
    const loc = [activity.locationName, activity.locationAddress].filter((s) => s && String(s).trim()).join(' ')
    const lines = [
      `【${activity.name || '活动'}】`,
      `时间：${scheduleStartFull || ''} — ${scheduleEndFull || ''}`,
      loc ? `地点：${loc}` : '',
      activity.reminder ? `提醒：${activity.reminder}` : '',
    ].filter(Boolean)
    wx.setClipboardData({
      data: lines.join('\n'),
      success: () => wx.showToast({ title: '活动摘要已复制', icon: 'success' }),
    })
  },

  onShareAction() {
    const { activity, activityId, startTimeText } = this.data
    wx.showActionSheet({
      itemList: ['分享给朋友', '复制活动信息', '生成活动海报'],
      success: async (res) => {
        if (res.tapIndex === 0) {
          // 触发系统分享（由按钮 open-type="share" 处理）
          wx.showToast({ title: '请点击右上角"..."分享', icon: 'none' })
        } else if (res.tapIndex === 1) {
          this.onCopyLink()
        } else if (res.tapIndex === 2) {
          wx.navigateTo({ url: `/pages/poster/index?activityId=${activityId}` })
        }
      },
    })
  },
})
