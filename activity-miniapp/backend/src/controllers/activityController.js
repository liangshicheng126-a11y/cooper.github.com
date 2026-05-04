// src/controllers/activityController.js
const crypto = require('crypto')
const { query, queryOne, transaction } = require('../config/db')
const { getCache, setCache, delCache, delCacheByPattern, CACHE_TTL, cacheAvailable } = require('../config/redis')
const wxService = require('../services/wxService')
const { genCheckinToken } = require('../utils/checkinToken')
const { parseJsonArray } = require('../utils/parseJsonField')
const { v4: uuidv4 } = require('uuid')
const logger = require('../utils/logger')
const QRCode = require('qrcode')
const { uploadPngBuffer, isCosReady } = require('../utils/cosUploadBuffer')
const { respondIfMissingModerationStatus } = require('../utils/mysqlErrors')

/** 发布后人工审核：默认 pending，仅 moderation_status=passed 会在发现广场展示。AUTO_APPROVE_ACTIVITY_PUBLISH=1/true 时跳过审核（多用于本地调试） */
function initialPublishModerationStatus() {
  const v = String(process.env.AUTO_APPROVE_ACTIVITY_PUBLISH || '').toLowerCase()
  if (v === '1' || v === 'true' || v === 'yes') return 'passed'
  return 'pending'
}

// viewerIsAdmin：平台管理员可预览待审核/下架等非公开活动（用于后台审核）
function viewerCanSeeActivitySnapshot({ moderationStatus, creatorOpenid, dbStatus }, viewerOid = '', viewerIsAdmin = false) {
  const mod = moderationStatus || 'passed'
  if (mod !== 'passed' && viewerOid !== creatorOpenid && !viewerIsAdmin) return false
  if (dbStatus && ['offline', 'frozen'].includes(dbStatus) && viewerOid !== creatorOpenid && !viewerIsAdmin) {
    return false
  }
  return true
}

/** 与 upload.js 生成的 COS 外链一致：本服务已鉴权上传，避免 img_sec_check 对二维码/COS 偶发失败导致无法保存 */
function isOurCosUploadedUrl(url) {
  const bucket = process.env.COS_BUCKET
  const region = process.env.COS_REGION
  if (!bucket || !region || typeof url !== 'string' || !url.trim()) return false
  const prefix = `https://${bucket}.cos.${region}.myqcloud.com/`
  return url.startsWith(prefix)
}

// 工具函数：获取活动状态
function getStatus(activity) {
  const now = new Date()
  const start = new Date(activity.start_time)
  const end = new Date(activity.end_time)
  if (activity.status === 'offline' || activity.status === 'cancelled') return activity.status
  if (now < start) return 'upcoming'
  if (now > end) return 'ended'
  if (activity.max_participants > 0 && activity.registration_count >= activity.max_participants) return 'full'
  return 'active'
}

function sanitizeQueryString(v) {
  if (v === undefined || v === null) return undefined
  const s = String(v).trim()
  if (!s || s === 'undefined' || s === 'null' || s === 'all') return undefined
  return s
}

const SORT_FIELDS = ['createdAt', 'startTime', 'registrationCount', 'distance']

exports.list = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const size = Math.min(50, Math.max(1, parseInt(req.query.size) || 10))
    const category = sanitizeQueryString(req.query.category)
    const keyword = sanitizeQueryString(req.query.keyword)
    const offset = (page - 1) * size

    const sortRaw = sanitizeQueryString(req.query.sort)
    const sort = SORT_FIELDS.includes(sortRaw) ? sortRaw : 'createdAt'
    const latQ = parseFloat(req.query.lat)
    const lngQ = parseFloat(req.query.lng)

    /** 服务端排序与白名单拼装，经纬度仅允许数字常量写入 ORDER BY */
    let orderBy = 'a.created_at DESC'
    if (sort === 'startTime') orderBy = 'a.start_time ASC'
    else if (sort === 'registrationCount') orderBy = 'registration_count DESC'
    else if (sort === 'distance') {
      if (
        Number.isFinite(latQ) &&
        Number.isFinite(lngQ) &&
        latQ >= -90 &&
        latQ <= 90 &&
        lngQ >= -180 &&
        lngQ <= 180
      ) {
        orderBy = `CASE WHEN a.latitude IS NULL OR a.longitude IS NULL THEN 1 ELSE 0 END ASC, (POW(a.latitude - ${latQ}, 2) + POW(a.longitude - ${lngQ}, 2)) ASC`
      }
    }

    const cacheKey = keyword
      ? null
      : `activities:list:${page}:${size}:${category || 'all'}:${sort}${
          sort === 'distance' &&
          Number.isFinite(latQ) &&
          Number.isFinite(lngQ) &&
          latQ >= -90 &&
          latQ <= 90 &&
          lngQ >= -180 &&
          lngQ <= 180
            ? `:${latQ.toFixed(3)}:${lngQ.toFixed(3)}`
            : ''
        }`

    if (cacheKey) {
      const cached = await getCache(cacheKey)
      if (cached) return res.json({ code: 0, data: cached })
    }

    let where =
      "a.status NOT IN ('offline','frozen') AND COALESCE(a.moderation_status, 'passed') = 'passed'"
    const params = []
    if (keyword) {
      where += ' AND (a.name LIKE ? OR a.location_name LIKE ? OR a.location_address LIKE ? OR a.description LIKE ?)'
      const like = `%${keyword}%`
      params.push(like, like, like, like)
    }
    if (category && category !== 'all') {
      if (category === 'active') where += ' AND NOW() BETWEEN a.start_time AND a.end_time'
      else if (category === 'upcoming') where += ' AND a.start_time > NOW()'
      else {
        where += ' AND a.category = ?'
        params.push(category)
      }
    }

    const list = await query(`
      SELECT a.*, u.nickname AS creator_nickname, u.avatar_url AS creator_avatar,
             (SELECT COUNT(*) FROM registrations r WHERE r.activity_id = a.id AND r.cancelled_at IS NULL) AS registration_count
      FROM activities a
      LEFT JOIN users u ON a.creator_openid = u.openid
      WHERE ${where}
      ORDER BY ${orderBy}
      LIMIT ${size} OFFSET ${offset}
    `, params)

    const result = { list: list.map(formatActivity), total: list.length }
    if (cacheKey) await setCache(cacheKey, result, CACHE_TTL.ACTIVITIES)
    res.json({ code: 0, data: result })
  } catch (e) {
    next(e)
  }
}

exports.featured = async (req, res, next) => {
  try {
    const cached = await getCache('activities:featured')
    if (cached) return res.json({ code: 0, data: cached })
    const list = await query(`
      SELECT a.*, (SELECT COUNT(*) FROM registrations r WHERE r.activity_id = a.id AND r.cancelled_at IS NULL) AS registration_count
      FROM activities a WHERE a.status NOT IN ('offline','frozen')
        AND COALESCE(a.moderation_status, 'passed') = 'passed' AND a.start_time > NOW()
      ORDER BY registration_count DESC LIMIT 5
    `)
    await setCache('activities:featured', list.map(formatActivity), CACHE_TTL.FEATURED)
    res.json({ code: 0, data: list.map(formatActivity) })
  } catch (e) {
    next(e)
  }
}

/** 仅活动创建者使用：签到人数 + 最近签到记录（不写进详情 Redis，避免泄露） */
async function fetchCreatorCheckinSummary(activityId) {
  const row = await queryOne(
    `SELECT COUNT(*) AS cnt FROM registrations
     WHERE activity_id = ? AND cancelled_at IS NULL AND checkin_time IS NOT NULL`,
    [activityId]
  )
  const rows = await query(
    `SELECT r.id, u.nickname AS name, u.avatar_url AS avatarUrl, r.checkin_time AS checkinTime
     FROM registrations r
     JOIN users u ON r.user_openid = u.openid
     WHERE r.activity_id = ? AND r.checkin_time IS NOT NULL AND r.cancelled_at IS NULL
     ORDER BY r.checkin_time DESC
     LIMIT 20`,
    [activityId]
  )
  return {
    checkinCount: Number(row?.cnt) || 0,
    recentCheckins: rows.map((r) => ({
      id: r.id,
      name: r.name || '用户',
      avatarUrl: r.avatarUrl || '',
      checkinTime: r.checkinTime,
    })),
  }
}

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params
    const viewerOid = req.user?.openid || ''
    const viewerAdmin = !!req.user?.isAdmin
    const cacheKey = `activity:${id}`

    const cached = await getCache(cacheKey)
    if (cached) {
      const okCache = viewerCanSeeActivitySnapshot(
        {
          moderationStatus: cached.moderationStatus,
          creatorOpenid: cached.creatorOpenid,
          dbStatus: cached.dbStatus || cached.rawStatus,
        },
        viewerOid,
        viewerAdmin,
      )
      if (!okCache) {
        return res.status(404).json({ code: 404, message: '活动不存在或未公开' })
      }
      const out = { ...cached }
      if (viewerOid && viewerOid === cached.creatorOpenid) {
        const summary = await fetchCreatorCheckinSummary(id)
        out.checkinCount = summary.checkinCount
        out.recentCheckins = summary.recentCheckins
      }
      return res.json({ code: 0, data: out })
    }

    const activity = await queryOne(`
      SELECT a.*, u.nickname AS creator_nickname, u.avatar_url AS creator_avatar,
             (SELECT COUNT(*) FROM registrations r WHERE r.activity_id = a.id AND r.cancelled_at IS NULL) AS registration_count
      FROM activities a
      LEFT JOIN users u ON a.creator_openid = u.openid
      WHERE a.id = ?
    `, [id])

    if (!activity) return res.status(404).json({ code: 404, message: '活动不存在' })

    if (
      !viewerCanSeeActivitySnapshot(
        {
          moderationStatus: activity.moderation_status || 'passed',
          creatorOpenid: activity.creator_openid,
          dbStatus: activity.status,
        },
        viewerOid,
        viewerAdmin,
      )
    ) {
      return res.status(404).json({ code: 404, message: '活动不存在或未公开' })
    }

    // 最近报名者头像
    const recentRegistrants = await query(
      `SELECT u.avatar_url AS avatarUrl FROM registrations r
       LEFT JOIN users u ON r.user_openid = u.openid
       WHERE r.activity_id = ? AND r.cancelled_at IS NULL
       ORDER BY r.created_at DESC LIMIT 8`,
      [id]
    )
    const data = { ...formatActivity(activity), recentRegistrants }

    // 创建者才能看到实际邀请码
    const currentOpenid = req.user?.openid
    if (activity.require_invite) {
      data.requireInvite = true
      data.inviteCode = (currentOpenid === activity.creator_openid) ? activity.invite_code : undefined
    }

    await setCache(cacheKey, data, CACHE_TTL.ACTIVITY_DETAIL)

    const out = { ...data }
    if (currentOpenid && currentOpenid === activity.creator_openid) {
      const summary = await fetchCreatorCheckinSummary(id)
      out.checkinCount = summary.checkinCount
      out.recentCheckins = summary.recentCheckins
    }
    res.json({ code: 0, data: out })
  } catch (e) {
    next(e)
  }
}

exports.create = async (req, res, next) => {
  try {
    const body = req.body
    const id = uuidv4()
    const modStatus = initialPublishModerationStatus()

    await wxService.moderateActivityPublish(body)

    await transaction(async (conn) => {
      /** INSERT … SET：避免 VALUES 占位符个数与列数难核对导致 MySQL 1136 */
      await conn.execute(
        `INSERT INTO activities SET
          id=?,
          creator_openid=?,
          name=?,
          description=?,
          start_time=?,
          end_time=?,
          location_name=?,
          location_address=?,
          location_country=?,
          latitude=?,
          longitude=?,
          max_participants=?,
          require_invite=?,
          invite_code=?,
          category=?,
          cover_image=?,
          reminder=?,
          wx_group_chat_name=?,
          wx_group_chat_qrcode_url=?,
          custom_fields=?,
          moderation_status=?,
          status=?,
          created_at=?`,
        [
          id,
          req.user.openid,
          body.name,
          body.description || '',
          body.startTime,
          body.endTime,
          body.locationName || '',
          body.locationAddress || '',
          body.locationCountry || 'CN',
          body.latitude || null,
          body.longitude || null,
          body.maxParticipants || 0,
          body.requireInvite ? 1 : 0,
          body.requireInvite ? (body.inviteCode || null) : null,
          body.category || 'other',
          body.coverImage || '',
          body.reminder || '',
          '',
          '',
          JSON.stringify(body.customFields || []),
          modStatus,
          'upcoming',
          new Date(),
        ]
      )

      // 插入子活动
      for (const sub of (body.subActivities || [])) {
        const subId = uuidv4()
        await conn.execute(
          `INSERT INTO sub_activities SET
            id=?,
            activity_id=?,
            name=?,
            start_time=?,
            end_time=?,
            location_name=?,
            max_participants=?,
            created_at=?`,
          [
            subId,
            id,
            sub.name,
            sub.startTime,
            sub.endTime,
            sub.locationName || '',
            sub.maxParticipants || 0,
            new Date(),
          ]
        )
      }
    })

    await delCacheByPattern('activities:list*')
    await delCache('activities:featured')
    res.status(201).json({ code: 0, data: { id, moderationStatus: modStatus } })
  } catch (e) {
    if (respondIfMissingModerationStatus(e, res)) return
    next(e)
  }
}

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params
    const activity = await queryOne('SELECT * FROM activities WHERE id = ?', [id])
    if (!activity) return res.status(404).json({ code: 404, message: '活动不存在' })
    if (activity.creator_openid !== req.user.openid) return res.status(403).json({ code: 403, message: '无权限' })

    const body = req.body
    const modStatus = initialPublishModerationStatus()
    await wxService.moderateActivityPublish(body)
    await query(
      `UPDATE activities SET name=?, description=?, start_time=?, end_time=?, location_name=?,
       location_address=?, location_country=?, latitude=?, longitude=?, max_participants=?,
       require_invite=?, invite_code=?, category=?, cover_image=?,
       reminder=?, custom_fields=?, moderation_status=?, updated_at=NOW() WHERE id=?`,
      [body.name, body.description || '', body.startTime, body.endTime, body.locationName || '',
       body.locationAddress || '', body.locationCountry || 'CN', body.latitude || null, body.longitude || null,
       body.maxParticipants || 0,
       body.requireInvite ? 1 : 0,
       body.requireInvite ? (body.inviteCode || null) : null,
       body.category || 'other', body.coverImage || '',
       body.reminder || '', JSON.stringify(body.customFields || []), modStatus, id]
    )
    await delCache(`activity:${id}`)
    await delCacheByPattern('activities:list*')
    await delCache('activities:featured')

    // 有变更则通知所有报名者
    const hasChange = body.locationName !== activity.location_name ||
      new Date(body.startTime).getTime() !== new Date(activity.start_time).getTime()
    if (hasChange) {
      await wxService.notifyAllRegistrants(id, `活动「${body.name}」信息已更新，请注意查看最新时间/地点。`)
    }

    res.json({ code: 0, message: '修改成功', data: { moderationStatus: modStatus } })
  } catch (e) {
    if (respondIfMissingModerationStatus(e, res)) return
    next(e)
  }
}

exports.offline = async (req, res, next) => {
  try {
    const { id } = req.params
    const { reason } = req.body
    await query("UPDATE activities SET status='offline', offline_reason=?, offline_at=NOW() WHERE id=?", [reason || '', id])
    await delCache(`activity:${id}`)
    await delCacheByPattern('activities:list*')
    await delCache('activities:featured')
    res.json({ code: 0, message: '已下架' })
  } catch (e) {
    next(e)
  }
}

exports.getSubActivities = async (req, res, next) => {
  try {
    const { id } = req.params
    const a = await queryOne(
      'SELECT creator_openid, moderation_status, status FROM activities WHERE id = ?',
      [id]
    )
    if (!a) return res.status(404).json({ code: 404, message: '活动不存在' })
    const viewer = req.user?.openid || ''
    const viewerAdmin = !!req.user?.isAdmin
    if (
      !viewerCanSeeActivitySnapshot(
        {
          moderationStatus: a.moderation_status || 'passed',
          creatorOpenid: a.creator_openid,
          dbStatus: a.status,
        },
        viewer,
        viewerAdmin,
      )
    ) {
      return res.status(404).json({ code: 404, message: '活动不存在或未公开' })
    }

    const subs = await query(
      `SELECT s.*, (SELECT COUNT(*) FROM registrations r WHERE r.sub_activity_id = s.id AND r.cancelled_at IS NULL) AS registration_count
       FROM sub_activities s WHERE s.activity_id = ? ORDER BY s.start_time`,
      [id]
    )
    res.json({ code: 0, data: subs })
  } catch (e) {
    next(e)
  }
}

exports.myCreated = async (req, res, next) => {
  try {
    const activities = await query(
      `SELECT a.*, (SELECT COUNT(*) FROM registrations r WHERE r.activity_id = a.id AND r.cancelled_at IS NULL) AS registration_count
       FROM activities a WHERE a.creator_openid = ? ORDER BY a.created_at DESC`,
      [req.user.openid]
    )
    res.json({ code: 0, data: activities.map(formatActivity) })
  } catch (e) {
    next(e)
  }
}

exports.getCheckinQRCode = async (req, res, next) => {
  try {
    const { id } = req.params
    const activity = await queryOne('SELECT * FROM activities WHERE id = ?', [id])
    if (!activity || activity.creator_openid !== req.user.openid) {
      return res.status(403).json({ code: 403, message: '无权限' })
    }
    const token = genCheckinToken(id)
    const queryStr = `activityId=${id}&token=${token}`
    const opts = { width: 640, margin: 2, errorCorrectionLevel: 'M' }
    let pngBuffer
    const forceMinicode = process.env.CHECKIN_QR_MODE === 'minicode'

    if (!forceMinicode) {
      try {
        const urlLink = await wxService.generateUrlLink({
          path: 'pages/checkin/index',
          query: queryStr,
        })
        pngBuffer = await QRCode.toBuffer(urlLink, opts)
      } catch (e) {
        logger.warn('[getCheckinQRCode] URL Link 不可用（多为个人主体），改无限制小程序码', e.message)
        if (!cacheAvailable()) {
          return res.status(503).json({
            code: 503,
            message: '个人主体需使用小程序码签到，请先启动 Redis 后再生成核验码',
          })
        }
        const sceneKey = crypto.randomBytes(8).toString('hex')
        await setCache(`checkin:scene:${sceneKey}`, { activityId: id, token }, 7200)
        pngBuffer = await wxService.generateUnlimitedWxacodeBuffer(sceneKey)
      }
    } else {
      if (!cacheAvailable()) {
        return res.status(503).json({
          code: 503,
          message: 'CHECKIN_QR_MODE=minicode 需要 Redis',
        })
      }
      const sceneKey = crypto.randomBytes(8).toString('hex')
      await setCache(`checkin:scene:${sceneKey}`, { activityId: id, token }, 7200)
      pngBuffer = await wxService.generateUnlimitedWxacodeBuffer(sceneKey)
    }
    let qrcodeUrl
    if (isCosReady()) {
      try {
        const key = `checkin-qr/${id}/${uuidv4()}.png`
        qrcodeUrl = await uploadPngBuffer(pngBuffer, key)
      } catch (cosErr) {
        logger.warn('[getCheckinQRCode] COS 上传失败，改回 DataURL', cosErr.message)
        qrcodeUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`
      }
    } else {
      qrcodeUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`
    }
    const total = await queryOne(
      'SELECT COUNT(*) AS cnt FROM registrations WHERE activity_id = ? AND cancelled_at IS NULL', [id]
    )
    res.json({ code: 0, data: { qrcodeUrl, totalRegistrations: total.cnt } })
  } catch (e) {
    next(e)
  }
}

exports.getQRCode = async (req, res, next) => {
  try {
    const { id } = req.params
    const qrcode = await wxService.generateMiniQRCode(`pages/activity-detail/index?id=${id}`)
    res.json({ code: 0, data: { qrcodeUrl: qrcode } })
  } catch (e) {
    next(e)
  }
}

exports.notifyAll = async (req, res, next) => {
  try {
    const { id } = req.params
    const { message } = req.body
    const activity = await queryOne('SELECT * FROM activities WHERE id = ?', [id])
    if (!activity || activity.creator_openid !== req.user.openid) return res.status(403).json({ code: 403, message: '无权限' })
    await wxService.notifyAllRegistrants(id, message || `活动「${activity.name}」有最新通知，请点击查看。`)
    res.json({ code: 0, message: '通知已发送' })
  } catch (e) {
    next(e)
  }
}

exports.report = async (req, res, next) => {
  try {
    const { activityId, reason } = req.body
    // 举报后自动冻结
    await query("UPDATE activities SET status='frozen' WHERE id = ?", [activityId])
    await query(
      'INSERT INTO reports (activity_id, reporter_openid, reason, created_at) VALUES (?, ?, ?, NOW())',
      [activityId, req.user.openid, reason]
    )
    // 通知管理员
    await wxService.notifyAdmins(`活动被举报：${activityId}，原因：${reason}`)
    res.json({ code: 0, message: '举报已提交' })
  } catch (e) {
    next(e)
  }
}

/** 仅更新交流群名称与二维码（不影响编辑活动表单） */
exports.patchWxGroupChat = async (req, res, next) => {
  try {
    const { id } = req.params
    const activity = await queryOne('SELECT * FROM activities WHERE id = ?', [id])
    if (!activity) return res.status(404).json({ code: 404, message: '活动不存在' })
    if (activity.creator_openid !== req.user.openid) {
      return res.status(403).json({ code: 403, message: '无权限' })
    }

    let name =
      typeof req.body.wxGroupChatName === 'string'
        ? req.body.wxGroupChatName.trim().slice(0, 200)
        : ''
    let url =
      typeof req.body.wxGroupChatQrcodeUrl === 'string'
        ? req.body.wxGroupChatQrcodeUrl.trim().slice(0, 800)
        : ''

    if (!name) name = (activity.name || '').slice(0, 200)
    await wxService.checkText(name)
    if (url && !isOurCosUploadedUrl(url)) await wxService.checkImage(url)

    await query(
      `UPDATE activities SET wx_group_chat_name = ?, wx_group_chat_qrcode_url = ?, updated_at = NOW() WHERE id = ?`,
      [name, url, id]
    )
    await delCache(`activity:${id}`)
    await delCacheByPattern('activities:list*')

    res.json({ code: 0, message: '已保存' })
  } catch (e) {
    next(e)
  }
}

exports.myRegistration = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!req.user) return res.json({ code: 0, data: null })
    const reg = await queryOne(
      'SELECT * FROM registrations WHERE activity_id = ? AND user_openid = ? AND cancelled_at IS NULL',
      [id, req.user.openid]
    )
    res.json({ code: 0, data: reg })
  } catch (e) {
    next(e)
  }
}

function formatActivity(a) {
  return {
    id: a.id,
    name: a.name,
    description: a.description,
    startTime: a.start_time,
    endTime: a.end_time,
    locationName:      a.location_name,
    locationAddress:   a.location_address,
    locationCountry:   a.location_country || 'CN',
    latitude:          a.latitude,
    longitude:         a.longitude,
    maxParticipants:   a.max_participants,
    requireInvite:     !!a.require_invite,
    registrationCount: a.registration_count || 0,
    category: a.category,
    coverImage: a.cover_image,
    reminder: a.reminder,
    wxGroupChatName:       a.wx_group_chat_name || '',
    wxGroupChatQrcodeUrl:  a.wx_group_chat_qrcode_url || '',
    customFields: parseJsonArray(a.custom_fields, []),
    moderationStatus: a.moderation_status || 'passed',
    offlineReason: a.offline_reason || '',
    dbStatus: a.status,
    status: getStatus(a),
    creatorOpenid: a.creator_openid,
    creatorNickname: a.creator_nickname,
    creatorAvatar: a.creator_avatar,
    createdAt: a.created_at,
  }
}

exports.formatActivity = formatActivity
exports.initialPublishModerationStatus = initialPublishModerationStatus
