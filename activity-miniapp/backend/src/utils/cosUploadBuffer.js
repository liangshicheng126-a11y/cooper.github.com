// 将内存中的 PNG 上传到 COS（与 upload 路由相同 bucket），返回公网 URL
const COS = require('cos-nodejs-sdk-v5')

function cosClient() {
  if (!process.env.TENCENT_SECRET_ID || !process.env.TENCENT_SECRET_KEY) return null
  return new COS({
    SecretId: process.env.TENCENT_SECRET_ID,
    SecretKey: process.env.TENCENT_SECRET_KEY,
  })
}

function isCosReady() {
  return !!(
    cosClient() &&
    process.env.COS_BUCKET &&
    process.env.COS_REGION
  )
}

async function uploadPngBuffer(buffer, key) {
  const cos = cosClient()
  if (!cos) throw new Error('COS 未配置')
  await new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: process.env.COS_BUCKET,
        Region: process.env.COS_REGION,
        Key: key,
        Body: buffer,
        ContentType: 'image/png',
      },
      (err) => (err ? reject(err) : resolve())
    )
  })
  return `https://${process.env.COS_BUCKET}.cos.${process.env.COS_REGION}.myqcloud.com/${key}`
}

module.exports = { uploadPngBuffer, isCosReady }
