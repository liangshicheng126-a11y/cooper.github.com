/**
 * 自定义导航：与右上角胶囊按钮垂直对齐，避免返回键压住状态栏时间
 */
function getMenuButtonAnchor() {
  try {
    const m = wx.getMenuButtonBoundingClientRect()
    if (
      m &&
      typeof m.top === 'number' &&
      m.top >= 0 &&
      typeof m.height === 'number' &&
      m.height > 0
    ) {
      return {
        top: m.top,
        height: m.height,
        bottom: m.bottom,
        left: m.left,
        width: m.width,
      }
    }
  } catch (e) {}
  try {
    const wi = typeof wx.getWindowInfo === 'function' ? wx.getWindowInfo() : wx.getSystemInfoSync()
    const sb = wi.statusBarHeight || 44
    return {
      top: sb + 6,
      height: 32,
      bottom: sb + 38,
      left: wi.windowWidth ? wi.windowWidth - 100 : 0,
      width: 87,
    }
  } catch (e2) {}
  try {
    const si = wx.getSystemInfoSync()
    const sb = si.statusBarHeight || 44
    const ww = si.windowWidth || si.screenWidth || 375
    return {
      top: sb + 6,
      height: 32,
      bottom: sb + 38,
      left: ww - 100,
      width: 87,
    }
  } catch (e3) {}
  return { top: 48, height: 32, bottom: 80, left: 0, width: 87 }
}

/**
 * 与胶囊同一行的内容区上边距（如搜索框顶对齐）
 */
function getCustomNavbarContentPaddingTop(extraPx = 0) {
  const m = getMenuButtonAnchor()
  return Math.ceil(m.top + extraPx)
}

module.exports = {
  getMenuButtonAnchor,
  getCustomNavbarContentPaddingTop,
}
