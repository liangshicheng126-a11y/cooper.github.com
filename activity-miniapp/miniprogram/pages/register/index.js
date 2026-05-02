// pages/register/index.js
const request = require('../../utils/request')
const { formatDate } = require('../../utils/date')

Page({
  data: {
    activityId: null,
    subId: null,
    activity: {},
    subActivity: null,
    fields: [],
    formData: {},
    startTimeText: '',
    inviteCode: '',
    inviteCodeError: '',
    submitting: false,
    forceRegister: false,
  },

  onLoad(options) {
    this.setData({
      activityId: options.activityId,
      subId: options.subId || null,
      forceRegister: options.force === '1',
    })
    this._loadData()
  },

  async _loadData() {
    wx.showLoading({ title: '加载中...' })
    try {
      const [actRes, subRes] = await Promise.all([
        request.get(`/activities/${this.data.activityId}`),
        this.data.subId
          ? request.get(`/activities/${this.data.activityId}/sub-activities/${this.data.subId}`)
          : Promise.resolve({ data: null }),
      ])
      const activity = actRes.data
      const sub = subRes.data
      this.setData({
        activity,
        subActivity: sub ? {
          ...sub,
          startTimeText: formatDate(sub.startTime, 'MM/DD HH:mm'),
        } : null,
        fields: activity.customFields || [],
        startTimeText: formatDate(activity.startTime, 'YYYY年MM月DD日 HH:mm'),
      })
      wx.setNavigationBarTitle({ title: `报名 - ${activity.name}` })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  onFormChange(e) {
    this.setData({ formData: e.detail.formData })
  },

  onInviteCodeInput(e) {
    this.setData({ inviteCode: e.detail.value.toUpperCase(), inviteCodeError: '' })
  },

  async onSubmit() {
    // 邀请码前置校验
    const { activity, inviteCode } = this.data
    if (activity.requireInvite) {
      if (!inviteCode.trim()) {
        this.setData({ inviteCodeError: '请输入邀请码' })
        return
      }
    }

    const form = this.selectComponent('#customForm')
    const { valid, data } = form.validate()
    if (!valid) return

    this.setData({ submitting: true })
    try {
      await request.post('/registrations', {
        activityId:    this.data.activityId,
        subActivityId: this.data.subId,
        customData:    data,
        forceRegister: this.data.forceRegister,
        inviteCode:    activity.requireInvite ? inviteCode.trim() : undefined,
      })
      wx.showToast({ title: '报名成功 🎉', icon: 'success' })
      const { SUBSCRIBE_TEMPLATES } = require('../../utils/config')
      wx.requestSubscribeMessage({
        tmplIds: [SUBSCRIBE_TEMPLATES.REMIND_24H, SUBSCRIBE_TEMPLATES.REMIND_1H],
        fail: () => {},
      })
      setTimeout(() => wx.navigateBack({ delta: 2 }), 1500)
    } catch (e) {
      // 邀请码错误时定向提示
      if (e.requireInvite || e.message?.includes('邀请码')) {
        this.setData({ inviteCodeError: e.message || '邀请码错误' })
      } else {
        wx.showToast({ title: e.message || '报名失败', icon: 'none' })
      }
    } finally {
      this.setData({ submitting: false })
    }
  },
})
