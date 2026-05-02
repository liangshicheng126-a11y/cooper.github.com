// components/activity-card/index.js
const { formatDate, formatRelative, getActivityStatus } = require('../../utils/date')
const i18n = require('../../utils/i18n')

const STATUS_MAP = {
  active:    { key: 'active', cls: 'status-active' },
  upcoming:  { key: 'upcoming', cls: 'status-upcoming' },
  ended:     { key: 'ended', cls: 'status-ended' },
  full:      { key: 'full', cls: 'status-full' },
  cancelled: { key: 'cancelled', cls: 'status-ended' },
  offline:   { key: 'offline', cls: 'status-ended' },
}

Component({
  properties: {
    activity: { type: Object, value: {} },
    localeRev: { type: Number, value: 0 },
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
    peopleUnit: '',
    registeredNoCapLine: '',
  },

  observers: {
    'activity, localeRev': function (a) {
      if (!a || !a.id) return
      const key = getActivityStatus(a)
      const mapped = STATUS_MAP[key] || STATUS_MAP.active
      const pct = a.maxParticipants > 0
        ? Math.min(100, Math.round((a.registrationCount / a.maxParticipants) * 100))
        : 0
      const progressClass = pct >= 90 ? 'fill-danger' : pct >= 60 ? 'fill-warning' : 'fill-primary'
      const lang = i18n.getLanguage()
      const dtFmt = lang === 'zh' ? 'MM月DD日 HH:mm' : 'MM-DD HH:mm'
      const pu = lang === 'zh' ? i18n.t('peopleUnit') : ''
      const noCapLine = i18n.t('enrolledNoCap').replace(/\{n\}/g, String(a.registrationCount))
      this.setData({
        statusKey: key,
        statusText: i18n.t(mapped.key),
        statusClass: mapped.cls,
        startTime: formatDate(a.startTime, dtFmt),
        publishTime: formatRelative(a.createdAt),
        progressPct: pct,
        progressClass,
        peopleUnit: pu,
        registeredNoCapLine: noCapLine,
      })
    },
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { id: this.data.activity.id })
    },
  },
})
