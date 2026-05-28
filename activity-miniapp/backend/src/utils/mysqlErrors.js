// 便于排查：新版本代码依赖 moderation_status；未跑迁移时为 MySQL ER_BAD_FIELD_ERROR (1054)

function isBadFieldError(err) {
  if (!err) return false
  const errno = err.errno
  return errno === 1054 || err.code === 'ER_BAD_FIELD_ERROR'
}

function isUnknownColumnModerationStatus(err) {
  if (!isBadFieldError(err)) return false
  const msg = String(err.sqlMessage || err.message || '')
  return msg.includes('moderation_status')
}

function isUnknownColumnWxGroupChat(err) {
  if (!isBadFieldError(err)) return false
  const msg = String(err.sqlMessage || err.message || '')
  return msg.includes('wx_group_chat')
}

/** 若为缺少 moderation_status，则已写入 JSON 响应并返回 true（调用方勿再 next） */
function respondIfMissingModerationStatus(err, res) {
  if (!isUnknownColumnModerationStatus(err)) return false
  const prod = process.env.NODE_ENV === 'production'
  const message = prod
    ? '活动在发布时需要数据库支持「审核状态」字段。请联系运维在数据库执行 migration_activity_moderation.sql 中的 ALTER，为 activities 表增加 moderation_status。'
    : '数据库缺少 moderation_status 列。请在 MySQL 中执行 database/migrate-all.sql（或 migration_activity_moderation.sql），然后重启后端。'

  res.status(500).json({ code: 500, message })
  return true
}

function respondIfMissingWxGroupChat(err, res) {
  if (!isUnknownColumnWxGroupChat(err)) return false
  const prod = process.env.NODE_ENV === 'production'
  const message = prod
    ? '数据库缺少微信群相关字段。请执行 migration_wx_group_chat.sql。'
    : '数据库缺少 wx_group_chat_name / wx_group_chat_qrcode_url 列。请执行 database/migrate-all.sql（或 migration_wx_group_chat.sql），然后重启后端。'

  res.status(500).json({ code: 500, message })
  return true
}

/** 活动相关接口共用的 schema 缺失提示 */
function respondIfActivitySchemaMismatch(err, res) {
  if (respondIfMissingModerationStatus(err, res)) return true
  if (respondIfMissingWxGroupChat(err, res)) return true
  return false
}

module.exports = {
  isBadFieldError,
  isUnknownColumnModerationStatus,
  isUnknownColumnWxGroupChat,
  respondIfMissingModerationStatus,
  respondIfMissingWxGroupChat,
  respondIfActivitySchemaMismatch,
}
