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

  async onSubmit() {
    const form = this.selectComponent('#customForm')
    const { valid, data } = form.validate()
    if (!valid) return

    this.setData({ submitting: true })
    try {
      await request.post('/registrations', {
        activityId: this.data.activityId,
        subActivityId: this.data.subId,
        customData: data,
        forceRegister: this.data.forceRegister,
      })
      wx.showToast({ title: '报名成功 🎉', icon: 'success' })
      // 申请订阅消息
      const { SUBSCRIBE_TEMPLATES } = require('../../utils/config')
      wx.requestSubscribeMessage({
        tmplIds: [SUBSCRIBE_TEMPLATES.REMIND_24H, SUBSCRIBE_TEMPLATES.REMIND_1H],
        fail: () => {},
      })
      setTimeout(() => wx.navigateBack({ delta: 2 }), 1500)
    } catch (e) {
      wx.showToast({ title: e.message || '报名失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },
})
