// schoolRosterController.js — 学校/院系学生名册 Excel 导入与报名核对

const path = require('path')
const XLSX = require('xlsx')
const { query, queryOne, transaction } = require('../config/db')
const { parseJsonObject } = require('../utils/parseJsonField')
const { encrypt, decrypt, maskPhone } = require('../utils/crypto')
const logger = require('../utils/logger')

const MAX_IMPORT_ROWS = 5000
const INSERT_CHUNK = 100

/** 表头别名：支持中英文常见列名 */
const SYNONYMS = {
  name: ['姓名', '名字', '学生姓名', 'name', 'studentname', 'xm', 'stu_name'],
  studentNo: ['学号', '学籍号', '学生证号', 'studentno', 'stu_no', 'number', 'xh', 'student_id'],
  phone: ['手机', '手机号', '电话', '移动电话', '联系电话', 'phone', 'tel', 'mobile', 'sjh'],
  grade: ['年级', 'year', 'grade'],
  clazz: ['班级', 'classname', 'class', 'bj', '行政班'],
  memo: ['备注', '说明', 'memo', 'remark', 'note'],
}

function normKey(k) {
  return String(k || '')
    .trim()
    .toLowerCase()
    .replace(/\s/g, '')
    .replace(/[（）()：:。.]/g, '')
}

/** 在行对象上按别名找列名 → 取值 */
function pick(row, synonyms) {
  const keys = Object.keys(row || {})
  for (const excelKey of keys) {
    const a = normKey(excelKey)
    if (!a) continue
    for (const syn of synonyms) {
      if (normKey(syn) === a) {
        const v = row[excelKey]
        if (v === undefined || v === null) return ''
        return String(v).trim()
      }
    }
  }
  return ''
}

function pickKeyUsed(row, synonyms) {
  const keys = Object.keys(row || {})
  for (const excelKey of keys) {
    const a = normKey(excelKey)
    if (!a) continue
    for (const syn of synonyms) {
      if (normKey(syn) === a) return excelKey
    }
  }
  return null
}

function normalizePhoneDigits(str) {
  const d = String(str || '').replace(/\D/g, '')
  const out = new Set()
  if (d.length >= 11) out.add(d.slice(-11))
  if (d.length === 11) out.add(d)
  return [...out].filter(Boolean)
}

function normalizeStudentNo(s) {
  return String(s || '').trim().replace(/\s/g, '').toUpperCase()
}

async function bulkInsert(conn, rosterId, items) {
  for (let i = 0; i < items.length; i += INSERT_CHUNK) {
    const chunk = items.slice(i, i + INSERT_CHUNK)
    const placeholders = chunk.map(() => '(?,?,?,?,?,?,?,?)').join(',')
    const flat = chunk.flatMap((it) => [
      rosterId,
      it.student_no,
      it.name,
      it.grade,
      it.clazz,
      it.phone_enc,
      it.memo,
      it.extra_json,
    ])
    await conn.execute(
      `INSERT INTO school_students (roster_id, student_no, name, grade, clazz, phone_enc, memo, extra) VALUES ${placeholders}`,
      flat
    )
  }
}

/**
 * multipart: file — Excel
 * fields: title 名册标题
 */
exports.importExcel = async (req, res, next) => {
  try {
    if (!req.file?.buffer?.length) {
      return res.status(400).json({ code: 400, message: '请上传 Excel 文件（.xlsx / .xls）' })
    }
    const title = String(req.body?.title || '未命名名册').trim().slice(0, 200)
    const filename = path.basename(req.file.originalname || 'import.xlsx')
    let wb
    try {
      wb = XLSX.read(req.file.buffer, { type: 'buffer' })
    } catch (e) {
      return res.status(400).json({ code: 400, message: '无法解析该 Excel，请检查后重试' })
    }
    const sheetName = wb.SheetNames[0]
    const ws = wb.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false, blankrows: false })

    if (!rows.length) {
      return res.status(400).json({ code: 400, message: '第一个工作表无数据行，请检查 Excel' })
    }

    const errors = []
    const toInsert = []
    let rowNum = 0

    for (const row of rows) {
      rowNum++
      if (rowNum > MAX_IMPORT_ROWS) {
        errors.push({ row: rowNum, reason: `超过单行上限 ${MAX_IMPORT_ROWS}` })
        break
      }
      const nameVal = pick(row, SYNONYMS.name)
      if (!nameVal) {
        errors.push({ row: rowNum, reason: '缺少姓名（或未识别姓名列）' })
        continue
      }
      const studentNoRaw = pick(row, SYNONYMS.studentNo)
      const grade = pick(row, SYNONYMS.grade).slice(0, 80)
      const clazz = pick(row, SYNONYMS.clazz).slice(0, 120)
      const memo = pick(row, SYNONYMS.memo).slice(0, 500)
      let phone = pick(row, SYNONYMS.phone).replace(/\s/g, '')
      if (!/^1\d{10}$/.test(phone || '')) {
        phone = ''
      }

      /** @type {Set<string>} */
      const reserved = new Set()
      ;[
        pickKeyUsed(row, SYNONYMS.name),
        pickKeyUsed(row, SYNONYMS.studentNo),
        pickKeyUsed(row, SYNONYMS.phone),
        pickKeyUsed(row, SYNONYMS.grade),
        pickKeyUsed(row, SYNONYMS.clazz),
        pickKeyUsed(row, SYNONYMS.memo),
      ].forEach((k) => k && reserved.add(k))

      const extra = {}
      for (const k of Object.keys(row)) {
        if (reserved.has(k)) continue
        const v = row[k]
        if (v === '' || v === undefined || v === null) continue
        const s = String(v).trim()
        if (!s) continue
        if (extra[k.slice(0, 60)] !== undefined && Object.keys(extra).length > 30) continue
        extra[k.slice(0, 120)] = s.length > 500 ? `${s.slice(0, 500)}…` : s
      }
      const extraJson = Object.keys(extra).length ? JSON.stringify(extra) : null

      toInsert.push({
        student_no: studentNoRaw.slice(0, 80),
        name: nameVal.slice(0, 100),
        grade,
        clazz,
        memo,
        phone_enc: phone ? encrypt(phone) : null,
        extra_json: extraJson,
      })
    }

    const succ = toInsert.length
    const failed = errors.length

    let rosterId
    await transaction(async (conn) => {
      const [ins] = await conn.execute(
        `INSERT INTO school_rosters (creator_openid, title, source_filename, row_success, row_failed, error_sample)
         VALUES (?,?,?,?,?,?)`,
        [
          req.user.openid,
          title,
          filename,
          succ,
          failed,
          JSON.stringify(errors.slice(0, 40)),
        ],
      )
      rosterId = ins.insertId
      if (succ) await bulkInsert(conn, rosterId, toInsert)
    })

    try {
      await query(
        `INSERT INTO audit_logs (operator_openid, action_type, target_id, content) VALUES (?,?,?,?)`,
        [req.user.openid, 'ROSTER_IMPORT', String(rosterId), `${title}/${filename} OK:${succ} FAIL:${failed}`],
      )
    } catch (logErr) {
      logger.warn('audit_logs roster import failed:', logErr.message)
    }

    logger.info(`Roster import ${rosterId} by ${req.user.openid}: success ${succ}, fail ${failed}`)

    res.json({
      code: 0,
      data: {
        rosterId,
        rowSuccess: succ,
        rowFailed: failed,
        errors: errors.slice(0, 20),
      },
      message: `导入完成：成功 ${succ} 条${failed ? `，失败 ${failed} 条` : ''}`,
    })
  } catch (e) {
    next(e)
  }
}

exports.listMyRosters = async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT id,
              title,
              source_filename AS sourceFilename,
              row_success AS rowSuccess,
              row_failed AS rowFailed,
              UNIX_TIMESTAMP(created_at) * 1000 AS createdAt
       FROM school_rosters WHERE creator_openid = ? ORDER BY id DESC LIMIT 80`,
      [req.user.openid],
    )
    res.json({ code: 0, data: rows })
  } catch (e) {
    next(e)
  }
}

exports.deleteRoster = async (req, res, next) => {
  try {
    const { id } = req.params
    const r = await queryOne(
      'SELECT id FROM school_rosters WHERE id = ? AND creator_openid = ?',
      [id, req.user.openid],
    )
    if (!r) return res.status(403).json({ code: 403, message: '无权限或名册不存在' })
    await query('DELETE FROM school_rosters WHERE id = ?', [id])
    res.json({ code: 0, message: '已删除' })
  } catch (e) {
    next(e)
  }
}

exports.pageStudents = async (req, res, next) => {
  try {
    const rosterId = parseInt(req.params.rosterId, 10)
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const size = Math.min(50, Math.max(1, parseInt(req.query.size, 10) || 20))

    const r = await queryOne(
      'SELECT id FROM school_rosters WHERE id = ? AND creator_openid = ?',
      [rosterId, req.user.openid],
    )
    if (!r) return res.status(403).json({ code: 403, message: '无权限' })

    const cntRows = await query('SELECT COUNT(*) AS c FROM school_students WHERE roster_id = ?', [rosterId])
    const total = Number(cntRows[0]?.c ?? 0) || 0
    const offset = (page - 1) * size
    const rows = await query(
      `SELECT id, student_no AS studentNo, name, grade, clazz, memo, phone_enc AS phoneEnc, extra,
              UNIX_TIMESTAMP(created_at) * 1000 AS createdAt
       FROM school_students WHERE roster_id = ? ORDER BY id ASC LIMIT ? OFFSET ?`,
      [rosterId, size, offset],
    )
    const data = rows.map((x) => {
      let phoneMasked = ''
      try {
        if (x.phoneEnc) phoneMasked = maskPhone(decrypt(x.phoneEnc) || '')
      } catch (_) {}
      let extraParsed = {}
      try {
        extraParsed = typeof x.extra === 'string' ? JSON.parse(x.extra || '{}') : x.extra || {}
      } catch (_) {}
      delete x.phoneEnc
      return { ...x, phoneMasked, extraParsed }
    })

    res.json({
      code: 0,
      data: {
        total,
        list: data,
        page,
        size,
      },
    })
  } catch (e) {
    next(e)
  }
}

/** 报名表与名册比对：手机号 / 学号 */
exports.checkActivityAgainstRoster = async (req, res, next) => {
  try {
    const { activityId } = req.params
    const rosterId = parseInt(req.query.rosterId, 10)
    if (!rosterId) return res.status(400).json({ code: 400, message: '缺少 rosterId' })

    const activity = await queryOne('SELECT id, creator_openid, custom_fields FROM activities WHERE id = ?', [activityId])
    if (!activity || activity.creator_openid !== req.user.openid) {
      return res.status(403).json({ code: 403, message: '无权限' })
    }

    const roster = await queryOne(
      'SELECT id FROM school_rosters WHERE id = ? AND creator_openid = ?',
      [rosterId, req.user.openid],
    )
    if (!roster) return res.status(403).json({ code: 403, message: '无权限或未找到名册' })

    const students = await query(
      'SELECT student_no, phone_enc FROM school_students WHERE roster_id = ?',
      [rosterId],
    )
    /** @type {Set<string>} */
    const phoneDigits = new Set()
    /** @type {Set<string>} */
    const studentNos = new Set()

    students.forEach((s) => {
      if (s.student_no) studentNos.add(normalizeStudentNo(s.student_no))
      const p = s.phone_enc ? decrypt(s.phone_enc) : ''
      normalizePhoneDigits(p).forEach((d) => phoneDigits.add(d))
    })

    const regs = await query(
      `SELECT r.id, r.custom_data
       FROM registrations r
       WHERE r.activity_id = ? AND r.cancelled_at IS NULL`,
      [activityId],
    )

    const results = []
    for (const reg of regs) {
      const custom = parseJsonObject(reg.custom_data, {})

      const plainParts = []
      for (const v of Object.values(custom)) {
        const p = decrypt(v) ?? v
        if (p) plainParts.push(String(p))
      }

      let matched = false
      /** @type {null | string} */
      let matchBy = null

      for (const blob of plainParts) {
        for (const c of normalizePhoneDigits(blob)) {
          if (phoneDigits.has(c)) {
            matched = true
            matchBy = 'phone'
            break
          }
        }
        if (matched) break
        const cand = normalizeStudentNo(blob)
        if (cand.length >= 2 && studentNos.has(cand)) {
          matched = true
          matchBy = 'student_no'
          break
        }
      }

      results.push({
        registrationId: reg.id,
        matched,
        matchBy,
      })
    }

    const matchedCnt = results.filter((x) => x.matched).length
    res.json({
      code: 0,
      data: { results, total: results.length, matchedCount: matchedCnt },
    })
  } catch (e) {
    next(e)
  }
}
