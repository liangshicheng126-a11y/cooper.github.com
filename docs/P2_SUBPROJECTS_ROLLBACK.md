# p2 二级作品集 — 撤回指南

基线标签：`pre-p2-subprojects-20260613`（二级路由改造前的 `main` 快照）

## 改造内容摘要

- `/portfolio/p2`：动态交互系统 Hub（设计稿展示 + 两个子作品集入口）
- `/portfolio/p2/personal-website`：个人网站设计（原「设计稿展示」以下的网站设计分析）
- `/portfolio/p2/smart-glasses`：智能眼镜 App 设计（占位页）

## 路径 1：回到改造前完整快照（推荐）

```powershell
cd X:\A\1
git fetch origin
git checkout main
git reset --hard pre-p2-subprojects-20260613
git push origin main
```

> 仅在确认要全量回滚时执行 `reset --hard` + `push`。推送后 GitHub Pages 会自动重新部署旧版（约 3–5 分钟）。

## 路径 2：仅撤销本次 merge commit（若已用 PR 合并）

```powershell
cd X:\A\1
git log --oneline -5
git revert -m 1 <merge_commit_sha>
git push origin main
```

## 路径 3：保留代码，临时关闭二级入口

若只想快速恢复「单页 p2」体验而不回滚 git：

1. 删除 `src/app/portfolio/p2/` 目录
2. 将 `p2` 加回 `src/app/portfolio/[id]/page.tsx` 的 `PROJECT_IDS`
3. 在 `ProjectDetailClient` 恢复设计稿展示与 `SiteDesignAnalysis`

## 验证回滚

- https://cooperliang.top/portfolio/p2/ 应恢复为单页结构
- `/portfolio/p2/personal-website` 应 404（改造前不存在）
