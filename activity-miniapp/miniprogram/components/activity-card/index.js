// components/activity-card/index.js
const { formatDate, formatRelative, getActivityStatus } = require('../../utils/date')
const i18n = require('../../utils/i18n')

const STATUS_MAP = {
  active:    { text: '进行中', cls: 'status-active' },
  upcoming:  { text: '未开始', cls: 'status-upcoming' },
  ended:     { text: '已结束', cls: 'status-ended' },
  full:      { text: '已报满', cls: 'status-full' },
  cancelled: { text: '已取消', cls: 'status-ended' },
  offline:   { text: '已下架', cls: 'status-ended' },
}

Component({
  properties: {
    activity: { type: Object, value: {} },
  },

  computed: {},

  data: {
    statusKey: '',
    statusText: '',
    statusClass: '',
    startTime: '',
    publishTime: '',
    progressPct: 0,
    progressClass: '',
  },

  observers: {
    'activity': function (a) {
      if (!a || !a.id) return
      const key = getActivityStatus(a)
      const { text, cls } = STATUS_MAP[key] || STATUS_MAP.active
      const pct = a.maxParticipants > 0
        ? Math.min(100, Math.round((a.registrationCount / a.maxParticipants) * 100))
        : 0
      const progressClass = pct >= 90 ? 'fill-danger' : pct >= 60 ? 'fill-warning' : 'fill-primary'
      this.setData({
        statusKey: key,
        statusText: i18n.t(key) || text,
        statusClass: cls,
        startTime: formatDate(a.startTime, 'MM月DD日 HH:mm'),
        publishTime: formatRelative(a.createdAt),
        progressPct: pct,
        progressClass,
      })
    },
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { id: this.data.activity.id })
    },
  },
})
