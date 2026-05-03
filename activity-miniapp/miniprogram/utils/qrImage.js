/**
 * 将 data:image/png;base64,... 转为本地路径，供 <image> 使用。
 * 优先 wx.base64ToArrayBuffer + writeFile（避免部分机型 encoding:'base64' 异常）。
 */
function dataUrlToLocalFile(dataUrl, activityId) {
  return new Promise((resolve, reject) => {
    if (!dataUrl || typeof dataUrl !== 'string') {
      reject(new Error('empty qr'))
      return
    }
    if (!dataUrl.startsWith('data:image')) {
      resolve(dataUrl)
      return
    }
    const comma = dataUrl.indexOf(',')
    if (comma < 0) {
      reject(new Error('bad data url'))
      return
    }
    const payload = dataUrl.slice(comma + 1).replace(/\s/g, '')
    if (!payload) {
      reject(new Error('bad data url'))
      return
    }
    const userPath = wx.env.USER_DATA_PATH
    if (!userPath) {
      console.warn('[qrImage] 无 wx.env.USER_DATA_PATH，请升级微信/基础库；推荐后端配置 COS 返回 https 图片')
      resolve(dataUrl)
      return
    }
    const fs = wx.getFileSystemManager()
    const safeId = String(activityId || 'act').replace(/[^\w-]/g, '_')
    const filePath = `${userPath}/checkin_qr_${safeId}.png`

    const ok = () => resolve(filePath)
    const bad = (e) => reject(e || new Error('writeFile'))

    if (typeof wx.base64ToArrayBuffer === 'function') {
      try {
        fs.writeFile({
          filePath,
          data: wx.base64ToArrayBuffer(payload),
          success: ok,
          fail: bad,
        })
      } catch (e) {
        bad(e)
      }
    } else {
      fs.writeFile({
        filePath,
        data: payload,
        encoding: 'base64',
        success: ok,
        fail: bad,
      })
    }
  })
}

module.exports = { dataUrlToLocalFile }
