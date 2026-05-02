// components/progress-bar/index.js
Component({
  properties: {
    current: { type: Number, value: 0 },
    total:   { type: Number, value: 0 },
    label:   { type: String, value: '报名人数' },
  },
  data: {
    percent: 0,
    colorType: 'normal',
  },
  observers: {
    'current, total'(current, total) {
      if (!total || total <= 0) {
        this.setData({ percent: 0, colorType: 'normal' })
        return
      }
      const pct = Math.min(100, Math.round((current / total) * 100))
      let colorType = 'normal'
      if (pct >= 100) colorType = 'danger'
      else if (pct >= 80) colorType = 'warning'
      this.setData({ percent: pct, colorType })
    },
  },
})
