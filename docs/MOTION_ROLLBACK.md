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
