# 侧边栏独立背景 — 撤回指南

基线标签：`pre-sidebar-bg-20260614`（本次侧边栏背景合并前的 `main` 快照）

## 路径 1：改动尚未合并到 main

```powershell
cd X:\A\1
git checkout main
git branch -D feat/sidebar-backdrop
```

## 路径 2：已合并到 main，撤销一次提交

```powershell
cd X:\A\1
git log --oneline -5   # 找到 feat(sidebar): add dedicated backdrop 的 commit SHA
git revert <commit_sha>
git push origin main
```

GitHub Pages 会在 push 后自动重新部署（约 1–3 分钟）。

## 路径 3：回到合并前完整快照

```powershell
cd X:\A\1
git fetch origin --tags
git checkout -b hotfix/restore-sidebar-bg pre-sidebar-bg-20260614
# 验证后合并到 main（需你确认）
```

## 路径 4：仅关闭 blob 动画（保留渐变背景）

侧边栏背景已按 `useMotionTier()` 降级：`minimal` / `reduced` 档自动停用 blob 漂移动画。无需额外开关。

## 涉及文件

- `src/components/SidebarBackdrop.tsx` — 背景层组件
- `src/components/Sidebar.tsx` — 集成背景层
- `src/app/globals.css` — `.sidebar-backdrop*` 样式

## 21st Magic MCP

本次设计参考站点 indigo 玻璃拟态 token（`globals.css` blob 色板 + `Sidebar` 现有结构）。Magic MCP API key 调用失败，改用手动实现；可在 [21st.dev Magic Console](https://21st.dev/magic/console) 更新 key 后复用 `/ui` 迭代。
