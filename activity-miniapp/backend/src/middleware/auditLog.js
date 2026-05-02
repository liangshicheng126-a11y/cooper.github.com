// src/middleware/auditLog.js - 审计日志中间件
const { query } = require('../config/db')
const logger = require('../utils/logger')

function auditLog(actionType) {
  return async (req, res, next) => {
    // 记录操作前继续
    const originalJson = res.json.bind(res)
    res.json = async function (data) {
      if (res.statusCode < 400) {
        try {
          await query(
            `INSERT INTO audit_logs (operator_openid, action_type, target_id, content, ip, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [
              req.user?.openid || 'anonymous',
              actionType,
              req.params?.id || req.body?.activityId || null,
              JSON.stringify({ path: req.path, body: req.body }).slice(0, 500),
              req.ip,
            ]
          )
        } catch (e) {
          logger.error('Audit log failed:', e.message)
        }
      }
      return originalJson(data)
    }
    next()
  }
}

module.exports = auditLog
