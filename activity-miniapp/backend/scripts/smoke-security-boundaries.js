#!/usr/bin/env node
/**
 * 静态安全边界自检：覆盖无需 MySQL 的高风险回归点。
 */

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8')
}

function assertContains(file, pattern, message) {
  const src = read(file)
  if (!pattern.test(src)) {
    throw new Error(`${message}\n  file: ${file}\n  expected: ${pattern}`)
  }
  console.log(`✓ ${message}`)
}

function main() {
  console.log('安全边界静态自检 —', new Date().toISOString())

  assertContains(
    'src/middleware/auth.js',
    /req\.user\s*=\s*\{\s*\.\.\.payload,\s*isAdmin:\s*isAdminOpenid\(payload\.openid\)\s*\}/,
    '管理员权限每次请求按 ADMIN_OPENIDS 重新计算',
  )

  assertContains(
    'src/controllers/activityController.js',
    /activity\.creator_openid\s*!==\s*req\.user\.openid\s*&&\s*!req\.user\.isAdmin/,
    '活动下架接口校验创建者或管理员',
  )

  assertContains(
    'src/controllers/checkinController.js',
    /SELECT creator_openid FROM activities WHERE id = \?/,
    '签到 token 数据接口先查询活动归属',
  )

  assertContains(
    'src/routes/admin.js',
    /router\.get\('\/reports',\s*auth,\s*adminOnly,\s*c\.getReports\)/,
    '举报列表仅平台管理员可访问',
  )

  assertContains(
    'src/controllers/adminController.js',
    /SELECT \* FROM reports WHERE id = \?/,
    '忽略举报按 report id 查询',
  )

  assertContains(
    'src/services/aiPosterService.js',
    /activity\.creator_openid\s*!==\s*req\.user\.openid\s*&&\s*!req\.user\.isAdmin/,
    'AI 海报生成校验活动归属或管理员',
  )

  assertContains(
    'src/cluster.js',
    /cluster\.fork\(\{\s*CLUSTER_WORKER:\s*'1'\s*\}\)/,
    'cluster worker 标记阻止重复启动 reminder job',
  )

  console.log('\n完成。\n')
}

try {
  main()
} catch (e) {
  console.error(`\n✗ ${e.message}\n`)
  process.exit(1)
}
