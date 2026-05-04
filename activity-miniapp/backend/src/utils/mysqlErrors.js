// 便于排查：新版本代码依赖 moderation_status；未跑迁移时为 MySQL ER_BAD_FIELD_ERROR (1054)

function isUnknownColumnModerationStatus(err) {
  if (!err) return false
  const errno = err.errno
  const msg = String(err.sqlMessage || err.message || '')
  if (!(errno === 1054 || err.code === 'ER_BAD_FIELD_ERROR')) return false
  return msg.includes('moderation_status')
}

/** 若为缺少 moderation_status，则已写入 JSON 响应并返回 true（调用方勿再 next） */
function respondIfMissingModerationStatus(err, res) {
  if (!isUnknownColumnModerationStatus(err)) return false
  const prod = process.env.NODE_ENV === 'production'
  const message = prod
    ? '活动在发布时需要数据库支持「审核状态」字段。请联系运维在数据库执行 migration_activity_moderation.sql 中的 ALTER，为 activities 表增加 moderation_status。'
    : '数据库缺少 moderation_status 列。请在 MySQL 中执行仓库内 database/migration_activity_moderation.sql，然后重启后端。本地调试也可临时回滚该列相关的 INSERT（不推荐）。'

  res.status(500).json({ code: 500, message })
  return true
}

module.exports = {
  isUnknownColumnModerationStatus,
  respondIfMissingModerationStatus,
}
