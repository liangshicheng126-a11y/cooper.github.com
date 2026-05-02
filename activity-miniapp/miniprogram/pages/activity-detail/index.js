// pages/activity-detail/index.js
const request = require('../../utils/request')
const { formatDate, getDurationText, getActivityStatus } = require('../../utils/date')
const { openNavigation } = require('../../utils/map')

const STATUS_MAP = {
  active: { text: '进行中', cls: 'badge-active' },
  upcoming: { text: '未开始', cls: 'badge-upcoming' },
  ended: { text: '已结束', cls: 'badge-ended' },
  full: { text: '已报满', cls: 'badge-full' },
  cancelled: { text: '已取消', cls: 'badge-ended' },
  offline: { text: '已下架', cls: 'badge-ended' },
}

Page({
  data: {
    activityId: null,
    activity: {},
    subActivities: [],
    selectedSubId: null,
    registrantAvatars: [],
    isRegistered: false,
    isCreator: false,
    showInviteCode: false,
    userRegistrationId: null,
    statusKey: '',
    statusText: '',
    statusClass: '',
    startTimeText: '',
    endTimeText: '',
    durationText: '',
    progressPct: 0,
    progressClass: '',
    descExpanded: false,
    cannotRegister: false,
    showConflictModal: false,
    conflictActivity: '',
    pendingRegisterParams: null,
    loadError: false,
    loading: true,
  },

  onLoad(options) {
    const id = options.id
    if (!id) {
      this.setData({ loading: false, loadError: true })
      return
    }
    this.setData({ activityId: id })
    this._loadDetail(id)
  },

  async _loadDetail(id) {
    wx.showNavigationBarLoading()
    try {
      const [actRes, subRes, regRes] = await Promise.all([
        request.get(`/activities/${id}`),
        request.get(`/activities/${id}/sub-activities`),
        request.get(`/activities/${id}/my-registration`),
      ])

      const activity = actRes.data
      if (!activity || !activity.id) {
        this.setData({ loading: false, loadError: true })
        return
      }

      const status = getActivityStatus(activity)
      const { text, cls } = STATUS_MAP[status] || STATUS_MAP.active
      const pct = activity.maxParticipants > 0
        ? Math.min(100, Math.round((activity.registrationCount / activity.maxParticipants) * 100))
        : 0
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

      this.setData({
        activity,
        subActivities,
        selectedSubId: regRes.data?.subActivityId || defaultSubId,
        registrantAvatars: (activity.recentRegistrants || []).map(r => r.avatarUrl).slice(0, 8),
        isRegistered: !!regRes.data,
        userRegistrationId: regRes.data?.id || null,
        isCreator: activity.creatorOpenid === app.globalData.openid,
        statusKey: status,
        statusText: text,
        statusClass: cls,
        startTimeText: formatDate(activity.startTime, 'YYYY年MM月DD日 HH:mm'),
        endTimeText: formatDate(activity.endTime, 'HH:mm'),
        durationText: getDurationText(activity.startTime, activity.endTime),
        progressPct: pct,
        progressClass: pct >= 90 ? 'danger' : '',
        cannotRegister: ['ended', 'full', 'cancelled', 'offline'].includes(status),
        loading: false,
      })
      wx.setNavigationBarTitle({ title: activity.name })
    } catch (e) {
      console.error('[activity-detail] 加载失败:', e)
      wx.showToast({ title: e.message || '加载失败', icon: 'none' })
      this.setData({ loadError: true, loading: false })
    } finally {
      wx.hideNavigationBarLoading()
    }
  },

  onRetry() {
    this.setData({ loadError: false })
    this._loadDetail(this.data.activityId)
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

  onNavigate() {
    const { activity } = this.data
    if (!activity.latitude || !activity.longitude) {
      wx.showToast({ title: '暂无坐标信息', icon: 'none' })
      return
    }

    // 海外地址（国内腾讯地图不支持），直接打开网页版地图
    const isIntl = activity.locationCountry === 'INTL' ||
      (activity.latitude && (activity.latitude < 3 || activity.latitude > 55 ||
       activity.longitude < 70 || activity.longitude > 140))

    if (isIntl) {
      const url = `https://maps.google.com/?q=${activity.latitude},${activity.longitude}`
      wx.setClipboardData({
        data: url,
        success: () => {
          wx.showModal({
            title: '海外地址导航',
            content: `Google Maps 链接已复制到剪贴板：\n${activity.locationName}\n\n可粘贴到浏览器打开导航`,
            showCancel: false,
            confirmText: '知道了',
          })
        },
      })
    } else {
      openNavigation(activity.latitude, activity.longitude, activity.locationName)
    }
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
    const text = `【活动通知】
📌 ${activity.name}
📅 时间：${this.data.startTimeText}
📍 地点：${activity.locationName || '待定'}
👥 名额：${activity.maxParticipants > 0 ? `${activity.registrationCount}/${activity.maxParticipants}人` : `${activity.registrationCount}人已报名（不限）`}
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

  onCheckinQR() {
    wx.navigateTo({ url: `/pages/checkin/index?activityId=${this.data.activityId}&mode=admin` })
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
    const { activityId, activity } = this.data
    const text = `【${activity.name || '活动'}】${activity.locationName ? '地点：' + activity.locationName + ' ' : ''}快来报名参加！`
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '活动信息已复制', icon: 'success' }),
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
