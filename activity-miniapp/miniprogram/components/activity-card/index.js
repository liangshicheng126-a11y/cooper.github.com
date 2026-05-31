// components/activity-card/index.js
const { formatDate, formatRelative, getActivityStatus } = require('../../utils/date')
const i18n = require('../../utils/i18n')
const { getStatusMeta, getProgressMeta } = require('../../utils/activityStatus')
const { resolveMediaUrl, resolveAvatarUrl } = require('../../utils/media')

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
    coverSrc: '',
    coverFailed: false,
    creatorAvatarSrc: '',
  },

  observers: {
    'activity, localeRev': function (a) {
      if (!a || !a.id) return
      const key = getActivityStatus(a)
      const status = getStatusMeta(key, 'card')
      const progress = getProgressMeta(a)
      const lang = i18n.getLanguage()
      const dtFmt = lang === 'zh' ? 'MM月DD日 HH:mm' : 'MM-DD HH:mm'
      const pu = lang === 'zh' ? i18n.t('peopleUnit') : ''
      const noCapLine = i18n.t('enrolledNoCap').replace(/\{n\}/g, String(a.registrationCount))
      const coverSrc = resolveMediaUrl(a.coverImage)
      const creatorAvatarSrc = resolveAvatarUrl(a.creatorAvatar) || ''
      this.setData({
        statusKey: key,
        statusText: status.text,
        statusClass: status.className,
        startTime: formatDate(a.startTime, dtFmt),
        publishTime: formatRelative(a.createdAt),
        progressPct: progress.percent,
        progressClass: progress.className,
        peopleUnit: pu,
        registeredNoCapLine: noCapLine,
        coverSrc,
        coverFailed: false,
        creatorAvatarSrc,
      })
    },
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { id: this.data.activity.id })
    },
    onCoverError() {
      this.setData({ coverFailed: true, coverSrc: '' })
    },
    onAvatarError() {
      this.setData({ creatorAvatarSrc: '' })
    },
  },
})
