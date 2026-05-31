const i18n = require('./i18n')
const { getActivityStatus } = require('./date')

const STATUS_DEF = {
  active: { textKey: 'active', cardClass: 'status-active', badgeClass: 'badge-active', miniClass: 'status-mini-active' },
  upcoming: { textKey: 'upcoming', cardClass: 'status-upcoming', badgeClass: 'badge-upcoming', miniClass: 'status-mini-upcoming' },
  ended: { textKey: 'ended', cardClass: 'status-ended', badgeClass: 'badge-ended', miniClass: 'status-mini-ended' },
  full: { textKey: 'full', cardClass: 'status-full', badgeClass: 'badge-full', miniClass: 'status-mini-full' },
  cancelled: { textKey: 'cancelled', cardClass: 'status-ended', badgeClass: 'badge-ended', miniClass: 'status-mini-ended' },
  offline: { textKey: 'offline', cardClass: 'status-ended', badgeClass: 'badge-ended', miniClass: 'status-mini-ended' },
}

function getStatusMeta(activity, variant = 'card') {
  const key = typeof activity === 'string' ? activity : getActivityStatus(activity || {})
  const def = STATUS_DEF[key] || STATUS_DEF.active
  const className = variant === 'badge'
    ? def.badgeClass
    : variant === 'mini'
      ? def.miniClass
      : def.cardClass

  return {
    key,
    text: i18n.t(def.textKey),
    className,
  }
}

function getProgressMeta(activity, dangerClass = 'fill-danger', warningClass = 'fill-warning', normalClass = 'fill-primary') {
  const count = Number(activity?.registrationCount) || 0
  const max = Number(activity?.maxParticipants) || 0
  const percent = max > 0 ? Math.min(100, Math.round((count / max) * 100)) : 0
  const className = percent >= 90 ? dangerClass : percent >= 60 ? warningClass : normalClass
  return { percent, className }
}

module.exports = {
  getStatusMeta,
  getProgressMeta,
}
