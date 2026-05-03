/**
 * 后端核验码为 data:image/png;base64,... 时，转为 image 组件可用的本地路径。
 * 真机上超长 data URL 常导致 <image> 空白。
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
    const match = dataUrl.match(/^data:image\/\w+;base64,([\s\S]+)$/)
    if (!match) {
      reject(new Error('bad data url'))
      return
    }
    const base64 = match[1].replace(/\s/g, '')
    const userPath = wx.env.USER_DATA_PATH
    if (!userPath) {
      resolve(dataUrl)
      return
    }
    const fs = wx.getFileSystemManager()
    const safeId = String(activityId || 'act').replace(/[^\w-]/g, '_')
    const filePath = `${userPath}/checkin_qr_${safeId}.png`
    fs.writeFile({
      filePath,
      data: base64,
      encoding: 'base64',
      success: () => resolve(filePath),
      fail: (e) => reject(e || new Error('writeFile')),
    })
  })
}

module.exports = { dataUrlToLocalFile }
