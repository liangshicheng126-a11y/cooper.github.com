// pages/create-activity/index.js
const request = require('../../utils/request')
const { toPickerValue, toPickerTimeValue } = require('../../utils/date')
const { chooseLocation } = require('../../utils/map')
const { upload } = require('../../utils/request')

const FIELD_TYPES = ['文本', '手机号', '邮箱', '身份证号', '单选', '多选', '下拉选择', '多行文本']
const FIELD_TYPE_KEYS = ['text', 'phone', 'email', 'idCard', 'radio', 'checkbox', 'select', 'textarea']

const PRESET_FIELDS = [
  { key: 'name', label: '姓名', type: 'name', desc: '报名者真实姓名' },
  { key: 'phone', label: '手机号', type: 'phone', desc: '用于活动通知和联系' },
  { key: 'email', label: '邮箱', type: 'email', desc: '电子邮件地址' },
  { key: 'idCard', label: '身份证号', type: 'idCard', desc: '实名制活动必填' },
]

Page({
  data: {
    isEdit: false,
    activityId: null,
    currentStep: 0,
    descriptionLen: 0,
    showLocationPicker: false,
    steps: ['基本信息', '时间地点', '报名设置'],
    submitting: false,
    today: toPickerValue(new Date()),
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    mapMarkers: [],
    activityTypes: [
      { key: 'sport', label: '运动', icon: '⚽' },
      { key: 'culture', label: '文化', icon: '🎭' },
      { key: 'volunteer', label: '公益', icon: '❤️' },
      { key: 'social', label: '社交', icon: '🎊' },
      { key: 'study', label: '学习', icon: '📚' },
      { key: 'food', label: '美食', icon: '🍜' },
      { key: 'travel', label: '出行', icon: '✈️' },
      { key: 'other', label: '其他', icon: '✨' },
    ],
    presetFields: PRESET_FIELDS,
    fieldTypes: FIELD_TYPES,
    form: {
      name: '',
      description: '',
      coverImage: '',
      reminder: '',
      category: 'other',
      hasLimit: false,
      maxParticipants: '',
      requireInvite: false,
      inviteCode: '',
      locationName: '',
      locationAddress: '',
      latitude: null,
      longitude: null,
      customFields: [],
      subActivities: [],
    },
    previewFields: [],
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ isEdit: true, activityId: options.id })
      this._loadActivity(options.id)
    }
  },

  async _loadActivity(id) {
    wx.showLoading({ title: '加载中...' })
    try {
      const res = await request.get(`/activities/${id}`)
      const a = res.data
      const startDt = new Date(a.startTime)
      const endDt = new Date(a.endTime)
      this.setData({
        form: {
          ...this.data.form,
          name: a.name,
          description: a.description || '',
          coverImage: a.coverImage || '',
          reminder: a.reminder || '',
          category: a.category || 'other',
          hasLimit: a.maxParticipants > 0,
          maxParticipants: a.maxParticipants > 0 ? String(a.maxParticipants) : '',
          locationName: a.locationName || '',
          locationAddress: a.locationAddress || '',
          latitude: a.latitude,
          longitude: a.longitude,
          customFields: a.customFields || [],
        },
        startDate: toPickerValue(startDt),
        startTime: toPickerTimeValue(startDt),
        endDate: toPickerValue(endDt),
        endTime: toPickerTimeValue(endDt),
      })
      this._updateMapMarkers()
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key
    const update = { [`form.${key}`]: e.detail.value }
    if (key === 'description') update.descriptionLen = e.detail.value.length
    this.setData(update)
  },

  onSelectCategory(e) {
    this.setData({ 'form.category': e.currentTarget.dataset.key })
  },

  onStartDateChange(e) {
    this.setData({ startDate: e.detail.value })
  },
  onStartTimeChange(e) {
    this.setData({ startTime: e.detail.value })
  },
  onEndDateChange(e) {
    this.setData({ endDate: e.detail.value })
  },
  onEndTimeChange(e) {
    this.setData({ endTime: e.detail.value })
  },

  async chooseCoverImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFile = res.tempFiles[0].tempFilePath
        wx.showLoading({ title: '上传中...' })
        try {
          const uploadRes = await upload('/upload/image', tempFile)
          this.setData({ 'form.coverImage': uploadRes.data.url })
        } catch (e) {
          wx.showToast({ title: '上传失败', icon: 'none' })
        } finally {
          wx.hideLoading()
        }
      },
    })
  },

  openLocationPicker() {
    this.setData({ showLocationPicker: true })
  },

  closeLocationPicker() {
    this.setData({ showLocationPicker: false })
  },

  onLocationSelect(e) {
    const { name, address, latitude, longitude } = e.detail
    this.setData({
      showLocationPicker: false,
      'form.locationName':    name,
      'form.locationAddress': address,
      'form.latitude':        latitude,
      'form.longitude':       longitude,
    })
    this._updateMapMarkers()
  },

  async chooseLocation() {
    this.openLocationPicker()
  },

  _updateMapMarkers() {
    const { latitude, longitude, locationName } = this.data.form
    if (latitude && longitude) {
      this.setData({
        mapMarkers: [{
          id: 1, latitude, longitude,
          title: locationName,
          iconPath: '/images/map-marker.png',
          width: 40, height: 40,
        }],
      })
    }
  },

  // 子活动
  addSubActivity() {
    const subs = [...this.data.form.subActivities, {
      name: '', startDate: '', startTime: '', endTime: '', maxParticipants: '', locationName: '',
    }]
    this.setData({ 'form.subActivities': subs })
  },

  removeSubActivity(e) {
    const idx = e.currentTarget.dataset.idx
    const subs = [...this.data.form.subActivities]
    subs.splice(idx, 1)
    this.setData({ 'form.subActivities': subs })
  },

  onSubInput(e) {
    const { idx, field } = e.currentTarget.dataset
    const subs = [...this.data.form.subActivities]
    subs[idx][field] = e.detail.value
    this.setData({ 'form.subActivities': subs })
  },

  onSubDateChange(e) {
    const { idx, field } = e.currentTarget.dataset
    const subs = [...this.data.form.subActivities]
    subs[idx][field] = e.detail.value
    this.setData({ 'form.subActivities': subs })
  },

  onSubTimeChange(e) {
    const { idx, field } = e.currentTarget.dataset
    const subs = [...this.data.form.subActivities]
    subs[idx][field] = e.detail.value
    this.setData({ 'form.subActivities': subs })
  },

  // 报名字段
  setNoLimit()  { this.setData({ 'form.hasLimit': false }) },
  setHasLimit() { this.setData({ 'form.hasLimit': true }) },

  setNoInvite()      { this.setData({ 'form.requireInvite': false, 'form.inviteCode': '' }) },
  setRequireInvite() {
    const code = this.data.form.inviteCode || this._randomCode()
    this.setData({ 'form.requireInvite': true, 'form.inviteCode': code })
  },
  onInviteCodeInput(e) {
    this.setData({ 'form.inviteCode': e.detail.value.toUpperCase() })
  },
  genInviteCode() {
    this.setData({ 'form.inviteCode': this._randomCode() })
  },
  copyInviteCode() {
    const code = this.data.form.inviteCode
    if (!code) return
    wx.setClipboardData({
      data: code,
      success: () => wx.showToast({ title: '已复制邀请码', icon: 'success' }),
    })
  },
  _randomCode(len = 6) {
    // 排除 0/O/1/I 等易混淆字符，生成易读的邀请码
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < len; i++) code += chars[Math.floor(Math.random() * chars.length)]
    return code
  },

  isFieldEnabled(key) {
    return this.data.form.customFields.some(f => f.key === key && f._isPreset)
  },

  isFieldRequired(key) {
    const f = this.data.form.customFields.find(f => f.key === key)
    return f?.required || false
  },

  togglePresetField(e) {
    const { key, label, type } = e.currentTarget.dataset
    const fields = [...this.data.form.customFields]
    const idx = fields.findIndex(f => f.key === key && f._isPreset)
    if (idx >= 0) {
      fields.splice(idx, 1)
    } else {
      fields.unshift({ key, label, type, required: true, _isPreset: true })
    }
    this.setData({ 'form.customFields': fields })
    this._updatePreview()
  },

  toggleFieldRequired(e) {
    const key = e.currentTarget.dataset.key
    const fields = [...this.data.form.customFields]
    const f = fields.find(f => f.key === key)
    if (f) f.required = !f.required
    this.setData({ 'form.customFields': fields })
  },

  addCustomField() {
    const fields = [...this.data.form.customFields, {
      key: `custom_${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
      options: [],
      optionsStr: '',
      _isPreset: false,
    }]
    this.setData({ 'form.customFields': fields })
  },

  removeCustomField(e) {
    const idx = e.currentTarget.dataset.idx
    const fields = [...this.data.form.customFields]
    fields.splice(idx, 1)
    this.setData({ 'form.customFields': fields })
    this._updatePreview()
  },

  onCustomFieldInput(e) {
    const { idx, field } = e.currentTarget.dataset
    const fields = [...this.data.form.customFields]
    fields[idx][field] = e.detail.value
    if (field === 'optionsStr') {
      fields[idx].options = e.detail.value.split(',').map(s => s.trim()).filter(Boolean)
    }
    this.setData({ 'form.customFields': fields })
    this._updatePreview()
  },

  onFieldTypeChange(e) {
    const idx = e.currentTarget.dataset.idx
    const fields = [...this.data.form.customFields]
    fields[idx].type = FIELD_TYPE_KEYS[e.detail.value]
    this.setData({ 'form.customFields': fields })
  },

  toggleCustomRequired(e) {
    const idx = e.currentTarget.dataset.idx
    const fields = [...this.data.form.customFields]
    fields[idx].required = !fields[idx].required
    this.setData({ 'form.customFields': fields })
  },

  getFieldTypeIdx(type) {
    return Math.max(0, FIELD_TYPE_KEYS.indexOf(type))
  },

  getFieldTypeName(type) {
    const idx = FIELD_TYPE_KEYS.indexOf(type)
    return idx >= 0 ? FIELD_TYPES[idx] : '文本'
  },

  _updatePreview() {
    const fields = this.data.form.customFields.filter(f => f.label).map(f => ({
      ...f,
      options: f.options || (f.optionsStr ? f.optionsStr.split(',').map(s => s.trim()) : []),
    }))
    this.setData({ previewFields: fields })
  },

  _validateStep(step) {
    const { form, startDate, startTime, endDate, endTime } = this.data
    if (step === 0) {
      if (!form.name?.trim()) {
        wx.showToast({ title: '请输入活动名称', icon: 'none' })
        return false
      }
    }
    if (step === 1) {
      if (!startDate || !startTime) {
        wx.showToast({ title: '请选择开始时间', icon: 'none' })
        return false
      }
      if (!endDate || !endTime) {
        wx.showToast({ title: '请选择结束时间', icon: 'none' })
        return false
      }
      if (!form.locationName) {
        wx.showToast({ title: '请选择活动地点', icon: 'none' })
        return false
      }
      const start = new Date(`${startDate} ${startTime}`)
      const end = new Date(`${endDate} ${endTime}`)
      if (end <= start) {
        wx.showToast({ title: '结束时间需晚于开始时间', icon: 'none' })
        return false
      }
    }
    return true
  },

  nextStep() {
    if (!this._validateStep(this.data.currentStep)) return
    if (this.data.currentStep < this.data.steps.length - 1) {
      this.setData({ currentStep: this.data.currentStep + 1 })
    } else {
      this._submit()
    }
  },

  prevStep() {
    if (this.data.currentStep > 0) {
      this.setData({ currentStep: this.data.currentStep - 1 })
    }
  },

  async _submit() {
    this.setData({ submitting: true })
    const { form, startDate, startTime, endDate, endTime, isEdit, activityId } = this.data
    const payload = {
      name: form.name.trim(),
      description: form.description,
      coverImage: form.coverImage,
      reminder: form.reminder,
      category: form.category,
      startTime: `${startDate}T${startTime}:00`,
      endTime: `${endDate}T${endTime}:00`,
      locationName: form.locationName,
      locationAddress: form.locationAddress,
      latitude: form.latitude,
      longitude: form.longitude,
      maxParticipants: form.hasLimit ? Number(form.maxParticipants) : 0,
      requireInvite:   form.requireInvite,
      inviteCode:      form.requireInvite ? form.inviteCode : undefined,
      customFields: form.customFields.filter(f => f.label).map(f => ({
        key: f.key,
        label: f.label,
        type: f.type,
        required: f.required,
        options: f.options || [],
        _isPreset: f._isPreset || false,
      })),
      subActivities: form.subActivities.filter(s => s.name).map(s => ({
        name: s.name,
        startTime: `${s.startDate || startDate}T${s.startTime || startTime}:00`,
        endTime: `${s.startDate || startDate}T${s.endTime || endTime}:00`,
        maxParticipants: s.maxParticipants ? Number(s.maxParticipants) : 0,
        locationName: s.locationName || form.locationName,
      })),
    }

    try {
      if (isEdit) {
        await request.put(`/activities/${activityId}`, payload)
        wx.showToast({ title: '修改成功', icon: 'success' })
        setTimeout(() => wx.navigateBack(), 1500)
      } else {
        const res = await request.post('/activities', payload)
        wx.showToast({ title: '发布成功 🎉', icon: 'success' })
        setTimeout(() => {
          wx.navigateTo({ url: `/pages/activity-detail/index?id=${res.data.id}` })
        }, 1500)
      }
    } catch (e) {
      wx.showToast({ title: e.message || '提交失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },
})
