// 将内存中的文件上传到 COS（与 upload 路由相同 bucket），返回公网 URL
const axios = require('axios')
const crypto = require('crypto')

function isCosReady() {
  return !!(
    process.env.TENCENT_SECRET_ID &&
    process.env.TENCENT_SECRET_KEY &&
    process.env.COS_BUCKET &&
    process.env.COS_REGION
  )
}

function hmacSha1(key, value) {
  return crypto.createHmac('sha1', key).update(value).digest('hex')
}

function sha1(value) {
  return crypto.createHash('sha1').update(value).digest('hex')
}

function encodeCosPath(key) {
  return `/${String(key).split('/').map(encodeURIComponent).join('/')}`
}

function buildCosAuthorization(method, key, contentType) {
  const now = Math.floor(Date.now() / 1000)
  const keyTime = `${now};${now + 600}`
  const host = `${process.env.COS_BUCKET}.cos.${process.env.COS_REGION}.myqcloud.com`
  const pathname = encodeCosPath(key)
  const headerString = `content-type=${encodeURIComponent(contentType)}&host=${host}`
  const httpString = `${method.toLowerCase()}\n${pathname}\n\n${headerString}\n`
  const stringToSign = `sha1\n${keyTime}\n${sha1(httpString)}\n`
  const signKey = hmacSha1(process.env.TENCENT_SECRET_KEY, keyTime)
  const signature = hmacSha1(signKey, stringToSign)

  return {
    host,
    pathname,
    authorization: [
      'q-sign-algorithm=sha1',
      `q-ak=${process.env.TENCENT_SECRET_ID}`,
      `q-sign-time=${keyTime}`,
      `q-key-time=${keyTime}`,
      'q-header-list=content-type;host',
      'q-url-param-list=',
      `q-signature=${signature}`,
    ].join('&'),
  }
}

async function uploadBuffer(buffer, key, contentType) {
  if (!isCosReady()) throw new Error('COS 未配置')
  const { host, pathname, authorization } = buildCosAuthorization('PUT', key, contentType)
  await axios.put(`https://${host}${pathname}`, buffer, {
    headers: {
      Authorization: authorization,
      'Content-Type': contentType,
      Host: host,
      'Content-Length': buffer.length,
    },
    maxBodyLength: Infinity,
    timeout: 30000,
  })
  return `https://${process.env.COS_BUCKET}.cos.${process.env.COS_REGION}.myqcloud.com/${key}`
}

function uploadPngBuffer(buffer, key) {
  return uploadBuffer(buffer, key, 'image/png')
}

module.exports = { uploadBuffer, uploadPngBuffer, isCosReady }
