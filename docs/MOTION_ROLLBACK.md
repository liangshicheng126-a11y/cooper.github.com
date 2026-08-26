# cooperliang.top 动效升级 — 撤回指南

基线标签：`pre-motion-refresh-20260529`（动效改造前的 `main` 快照）  
功能分支：`feat/motion-bold-hybrid`  
运行时开关：`NEXT_PUBLIC_MOTION_V2`（`true` 启用新动效，`false` 回退为 Framer 默认行为）

## 路径 1：改动尚未合并到 main

```powershell
cd X:\A\1
git checkout main
git branch -D feat/motion-bold-hybrid
```

线上不受影响（未 push 到 `main`）。

## 路径 2：已合并到 main，需要撤销一次合并

```powershell
cd X:\A\1
git log --oneline -5   # 找到 merge commit SHA
git revert -m 1 <merge_commit_sha>
git push origin main
```

GitHub Pages 会在 push 后自动重新部署旧代码（约 1–3 分钟）。

## 路径 3：回到动效前完整快照

```powershell
cd X:\A\1
git fetch origin
git checkout -b hotfix/restore-motion pre-motion-refresh-20260529
# 验证后合并或 force-push 到 main（需你确认）
```

## 路径 4：不 revert，仅关闭新动效

在 `.env.local` 或 CI 环境变量中设置：

```
NEXT_PUBLIC_MOTION_V2=false
```

然后重新 `npm run build` 并部署。GSAP 组件会回退为 Framer 行为。

## 满意后合并（需你确认）

```powershell
cd X:\A\1
git checkout main
git merge --no-ff feat/motion-bold-hybrid
git push origin main
```

`main` 推送会触发 `.github/workflows/deploy-pages.yml`，自动发布到 https://cooperliang.top

---

## 夜间放映式开场回滚

远端基线分支：`backup/cooper-before-opening-animation-20260826-1449`
基线提交：`036cf74d17d785493fa355af5620e4572f927aff`
运行时开关：`NEXT_PUBLIC_INTRO_ENABLED`（`true` 启用开场，`false` 关闭且保留代码）

### 路径 A：不改代码，立即关闭开场

在 `.env.local` 或 CI build env 中设置：

```
NEXT_PUBLIC_INTRO_ENABLED=false
```

然后 `npm run build` 并重新部署。站点会直接显示首页，其余 GSAP、FloatingLines、DepthText 与页面切换动效保持不变。

### 路径 B：撤销开场提交

```powershell
cd X:\A\1
# 先撤销容错加固，再撤销开场主体；顺序不可颠倒
git revert --no-edit 6eae6b73b23c93d347a448d2197ea8b1f7125419
git revert --no-edit 4150c2770a7da2052594a194045eada4ae478ebf
git push origin main
```

GitHub Pages 会自动重新部署撤回后的版本。

### 路径 C：从远端快照创建恢复分支

```powershell
cd X:\A\1
git fetch origin
git checkout -b hotfix/restore-before-opening origin/backup/cooper-before-opening-animation-20260826-1449
npm run build
# 验证后再合并到 main；不要直接强推覆盖其他人的后续改动
```

### 验收与强制重播

- 正常访问：每个浏览器会话仅在第一次进入首页时播放。
- 强制重播：在首页地址后添加 `?intro=1`。
- 无界面应急结束：按 `Esc`。
- 系统开启“减少动态效果”时，开场不会挂载，页面内容直接可见。

---

## 左向右分幕开场回滚（2026-08-26）

本轮把开场顺序更新为“COOPER. → FloatingLines 从左向右铺开 → 页面详情”。

远端基线分支：`backup/cooper-before-left-to-right-opening-20260826-1649`
基线提交：`4c2bf3d16301961be7b47e13270f0332eb472e1d`
功能提交：`5cb350ae922b8927b9fce540e2a78730528ca691`
退场顺序修正：`8a09bfb6a69c228f85f4d1ec1ab23cded743645c`

### 仅撤销本轮分幕顺序

```powershell
cd X:\A\1
git revert --no-edit 8a09bfb6a69c228f85f4d1ec1ab23cded743645c
git revert --no-edit 5cb350ae922b8927b9fce540e2a78730528ca691
git push origin main
```

这会恢复到上一版“COOPER. 后直接揭开首页”的开场，其他网站内容不变。

### 从本轮基线建立恢复分支

```powershell
cd X:\A\1
git fetch origin
git checkout -b hotfix/restore-before-left-to-right-opening origin/backup/cooper-before-left-to-right-opening-20260826-1649
npm run build
```

若只想临时关闭所有开场，继续使用构建变量 `NEXT_PUBLIC_INTRO_ENABLED=false`。
