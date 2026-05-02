// components/custom-form/index.js
Component({
  properties: {
    fields: { type: Array, value: [] },
    initialData: { type: Object, value: {} },
  },

  data: {
    formData: {},
    errors: {},
  },

  observers: {
    'initialData': function (val) {
      if (val && Object.keys(val).length) {
        this.setData({ formData: { ...val } })
      }
    },
    'fields': function (fields) {
      if (!fields?.length) return
      const formData = { ...this.data.formData }
      fields.forEach(f => {
        if (formData[f.key] === undefined) {
          formData[f.key] = f.type === 'checkbox' ? [] : ''
        }
      })
      this.setData({ formData })
    },
  },

  methods: {
    onInput(e) {
      const key = e.currentTarget.dataset.key
      const formData = { ...this.data.formData, [key]: e.detail.value }
      const errors = { ...this.data.errors }
      delete errors[key]
      this.setData({ formData, errors })
      this.triggerEvent('change', { formData })
    },

    onSelect(e) {
      const { key, value } = e.currentTarget.dataset
      const formData = { ...this.data.formData, [key]: value }
      this.setData({ formData })
      this.triggerEvent('change', { formData })
    },

    onCheckbox(e) {
      const { key, value } = e.currentTarget.dataset
      const current = [...(this.data.formData[key] || [])]
      const idx = current.indexOf(value)
      if (idx >= 0) current.splice(idx, 1)
      else current.push(value)
      const formData = { ...this.data.formData, [key]: current }
      this.setData({ formData })
      this.triggerEvent('change', { formData })
    },

    onPickerChange(e) {
      const { key, options } = e.currentTarget.dataset
      const value = options[e.detail.value]
      const formData = { ...this.data.formData, [key]: value }
      this.setData({ formData })
      this.triggerEvent('change', { formData })
    },

    isChecked(key, value) {
      const arr = this.data.formData[key] || []
      return arr.includes(value)
    },

    getSelectIndex(key, options) {
      const val = this.data.formData[key]
      const idx = options.indexOf(val)
      return idx >= 0 ? idx : 0
    },

    // 外部调用 validate 方法
    validate() {
      const { fields, formData } = this.data
      const errors = {}
      let valid = true

      fields.forEach(f => {
        if (!f.required) return
        const val = formData[f.key]
        if (!val || (Array.isArray(val) && !val.length) || (typeof val === 'string' && !val.trim())) {
          errors[f.key] = `${f.label}不能为空`
          valid = false
          return
        }
        // 字段格式校验
        if (f.type === 'phone' && !/^1[3-9]\d{9}$/.test(val)) {
          errors[f.key] = '请输入正确的手机号'
          valid = false
        }
        if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          errors[f.key] = '请输入正确的邮箱地址'
          valid = false
        }
        if (f.type === 'idCard' && !/^\d{17}[\dXx]$/.test(val)) {
          errors[f.key] = '请输入正确的身份证号码'
          valid = false
        }
      })

      this.setData({ errors })
      return { valid, data: formData }
    },

    getData() {
      return this.data.formData
    },

    reset() {
      const formData = {}
      this.data.fields.forEach(f => {
        formData[f.key] = f.type === 'checkbox' ? [] : ''
      })
      this.setData({ formData, errors: {} })
    },
  },
})
