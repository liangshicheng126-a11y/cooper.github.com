# 可编辑 Figma 图层导入指南（cooperliang.top）

截图插件只能做**视觉参考**。要得到**可编辑文字、Auto Layout、真实图片填充**的 Figma 文件，请用下面任一方式。

目标文件：[cooper 设计稿](https://www.figma.com/design/nKd47PkEOE3f2HgK62BAAZ/cooper)

## 方案 A：html.to.design（推荐，免费版可用）

1. 在 Figma 打开 `cooper` 文件  
2. **Plugins → Manage plugins** → 搜索 **html.to.design** → Install  
3. 运行插件，在 URL 栏输入：`https://cooperliang.top`  
4. 视口宽度建议：
   - Desktop：**1440**
   - Mobile：**390**
5. 分别导入首页、作品集、关于、联系等路径（或在插件里选多页面）  
6. 导入结果：**Frame 内为可编辑图层**（文字可改、组件可拆）

免费版有导入次数限制；复杂动效 / GSAP / backdrop-filter 会近似为静态样式。

## 方案 B：Builder.io Figma 插件

1. 安装社区插件 **Builder.io**（或 **HTML to Figma**）  
2. 打开 **Import** 标签，粘贴 `https://cooperliang.top`  
3. 选择视口宽度后 Import  

## 方案 C：Figma Chrome 扩展（需付费计划才能粘贴到画布）

Figma 官方扩展可将网页捕获为图层，但 **Starter 免费版** 在 beta 期间可能无法粘贴到 Design 画布。若你升级计划可尝试：

1. 安装 [Figma Chrome extension](https://www.figma.com/downloads/)  
2. 打开 cooperliang.top → 点击扩展捕获 → 在 Figma 中 `Ctrl+V` 粘贴  

## 与本仓库设计令牌配合

导入可编辑图层后，对照 `design-export/figma-tokens.json` 统一颜色与圆角：

| Token | 值 |
|-------|-----|
| indigo-500 | `#6366F1` |
| purple-500 | `#A855F7` |
| 卡片圆角 | 24px |
| CTA 圆角 | 16px |
| 字体 | Inter |

运行 **Cooper Site Import** 插件可自动创建 `Color/*` 与 `Type/*` 本地样式。

## 免费版 3 页限制

每个文件最多 **3 个 Page**。建议结构：

1. **Design Tokens** — 色板 + 样式  
2. **Desktop** — html.to.design 桌面导入  
3. **Mobile** — html.to.design 移动导入  

或 Desktop / Mobile 放在同一 Page 左右两列。
