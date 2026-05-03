#!/usr/bin/env node
/**
 * 活动现场核验二维码链路自检（不启动 Express、不连 MySQL）
 *
 * 用法（在 backend 目录）:
 *   node scripts/smoke-checkin-qr-pipeline.js
 *
 * 会读取 ../.env（若存在）。若配置了 WX_APP_ID + WX_APP_SECRET，会直连微信换 url_link（不经过 Redis）。
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const axios = require('axios')
const path = require('path')
const QRCode = require('qrcode')

function step(title) {
  console.log(`\n=== ${title} ===`)
}

async function main() {
  console.log('核验二维码流水线自检 —', new Date().toISOString())

  step('1. 环境变量')
  const pairs = [
    ['JWT_SECRET', '签到 token HMAC（缺省时本脚本会填临时值仅用于 2～3 步）'],
    ['WX_APP_ID', '微信小程序 AppId（第 4 步换 URL Link）'],
    ['WX_APP_SECRET', '微信小程序 Secret'],
    ['COS_BUCKET + COS_REGION + TENCENT_SECRET_ID', 'COS 上传核验图（可选）'],
  ]
  for (const [k, hint] of pairs) {
    let ok = false
    if (k.includes('+')) {
      ok =
        !!process.env.COS_BUCKET &&
        !!process.env.COS_REGION &&
        !!process.env.TENCENT_SECRET_ID
    } else {
      ok = !!process.env[k]
    }
    console.log(`  ${ok ? '✓' : '○'} ${k}`)
    if (!ok) console.log(`      └─ ${hint}`)
  }

  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'smoke-jwt-secret-at-least-32-characters'
    console.log('  （已设临时 JWT_SECRET 仅用于本地 token 演示）')
  }

  step('2. 签到 token（checkinToken.js）')
  const { genCheckinToken, isValidCheckinToken } = require(path.join(__dirname, '../src/utils/checkinToken'))
  const activityId = '00000000-0000-0000-0000-000000000099'
  const token = genCheckinToken(activityId)
  const valid = isValidCheckinToken(activityId, token)
  console.log('  activityId:', activityId)
  console.log('  token:', token)
  console.log('  校验:', valid ? '通过' : '失败')

  step('3. 本地生成 PNG（qrcode → Buffer，无微信）')
  const mockLink = 'https://wxaurl.cn/smoke-test-link'
  const png = await QRCode.toBuffer(mockLink, { width: 320, margin: 2, errorCorrectionLevel: 'M' })
  const b64 = `data:image/png;base64,${png.toString('base64')}`
  console.log('  PNG 字节:', png.length)
  console.log('  DataURL 前缀:', b64.slice(0, 42) + '...')
  console.log('  ✓ 与 getCheckinQRCode 中 QRCode.toBuffer 一致')

  step('4. 微信 generate_urllink（可选）')
  const appid = process.env.WX_APP_ID
  const secret = process.env.WX_APP_SECRET
  if (!appid || !secret) {
    console.log('  跳过：未配置 WX_APP_ID / WX_APP_SECRET')
    console.log('  配置后重跑本脚本，或启动后端后用手机小程序走完整流程。')
  } else {
    try {
      const { data: tok } = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
        params: { grant_type: 'client_credential', appid, secret },
        timeout: 15000,
      })
      if (!tok.access_token) {
        console.log('  ✗ 无法获取 access_token:', tok.errmsg || JSON.stringify(tok))
      } else {
        const queryStr = `activityId=${activityId}&token=${token}`
        const { data: linkRes } = await axios.post(
          `https://api.weixin.qq.com/wxa/generate_urllink?access_token=${tok.access_token}`,
          {
            path: 'pages/checkin/index',
            query: queryStr,
            env_version: process.env.WX_MINI_ENV_VERSION || 'release',
            is_expire: false,
          },
          { timeout: 15000 }
        )
        if (linkRes.errcode && linkRes.errcode !== 0) {
          console.log('  ✗ generate_urllink:', linkRes.errcode, linkRes.errmsg)
        } else if (!linkRes.url_link) {
          console.log('  ✗ 无 url_link:', JSON.stringify(linkRes).slice(0, 200))
        } else {
          console.log('  ✓ url_link:', linkRes.url_link.slice(0, 56) + '...')
          const png2 = await QRCode.toBuffer(linkRes.url_link, { width: 320, margin: 2 })
          console.log('  ✓ 真实链接二维码 PNG 字节:', png2.length)
        }
      }
    } catch (e) {
      console.log('  ✗', e.message)
    }
  }

  step('5. COS 上传（可选，与 cosUploadBuffer.js 一致）')
  const { isCosReady, uploadPngBuffer } = require(path.join(__dirname, '../src/utils/cosUploadBuffer'))
  if (!isCosReady()) {
    console.log('  未配置完整 COS，后端将返回 DataURL；小程序需 qrImage 落盘或升级基础库。')
  } else {
    try {
      const { v4: uuidv4 } = require('uuid')
      const key = `checkin-qr/smoke/${uuidv4()}.png`
      const url = await uploadPngBuffer(png, key)
      console.log('  ✓ 已上传:', url)
    } catch (e) {
      console.log('  ✗ COS 上传失败:', e.message)
    }
  }

  step('6. 启动整站时还需')
  console.log('  · MySQL + Redis：app.listen 前会 db.authenticate()，微信 access_token 会走 Redis 缓存')
  console.log('  · 小程序：downloadFile 合法域名含 COS 域名；工具里 API_BASE_URL 指向本后端')
  console.log('  · 真机：发布者 活动详情 → 核验二维码 → 应显示图；报名者 微信扫一扫 该图')

  console.log('\n完成。\n')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
