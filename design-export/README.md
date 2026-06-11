# cooperliang.top → Figma 导出

将线上站点以**参考画板 + 设计令牌**形式导入 Figma 文件  
[cooper](https://www.figma.com/design/nKd47PkEOE3f2HgK62BAAZ/cooper)。

## 免费版能还原到什么程度？

| 层级 | 方式 | 还原度 |
|------|------|--------|
| 视觉参考 | 视口截图画板（Desktop 1440×900 / Mobile 390×844，首屏） | 高 |
| 设计系统 | Color / Text Styles + Tokens 页色板 | 中高 |
| 可编辑组件 | 需手动按截图重建 Auto Layout | 中 |
| 动效 / GSAP / 玻璃模糊 | Figma 免费版仅近似（截图或静态模糊） | 低 |

动效、blob 背景、backdrop-filter 等无法 1:1 转为可编辑矢量，以截图参考 + 令牌为主。

## 一键重新生成

```bash
npm run export-figma
```

输出：

- `screenshots/` — 各页面 PNG
- `export-manifest.json` — 元数据
- `figma-plugin/code.js` — 内嵌图片的导入插件

## 导入到你的 Figma 文件

1. 打开 [cooper 设计文件](https://www.figma.com/design/nKd47PkEOE3f2HgK62BAAZ/cooper)
2. 菜单 **Plugins → Development → Import plugin from manifest…**
3. 选择本目录下的 `figma-plugin/manifest.json`
4. **Plugins → Development → Cooper Site Import** 运行一次
5. 将更新页面：`Design Tokens`（首次）、`Desktop`（左列桌面 + 右列移动，共 10 张）

**若 Desktop 页空白**：旧版全页截图超过 Figma 4096px 上限。请重新 `npm run export-figma` 后再运行插件。

## 更高还原（可选）

在 Figma 中安装免费插件 **html.to.design**，输入 `https://cooperliang.top` 可生成可编辑图层（免费版有次数限制）。

## Framelink MCP

若需 Cursor 直接读取 Figma 文件，请在 Framelink 设置中刷新 Figma Personal Access Token（当前 token 已过期）。
