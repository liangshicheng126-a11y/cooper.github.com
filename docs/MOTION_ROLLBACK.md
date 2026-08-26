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
git log --oneline -5   # 找到“Add the screening room opening”提交
git revert <opening_commit_sha>
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
- 键盘跳过：按 `Esc`；也可以点击右下角“跳过 / SKIP”。
- 系统开启“减少动态效果”时，开场不会挂载，页面内容直接可见。
