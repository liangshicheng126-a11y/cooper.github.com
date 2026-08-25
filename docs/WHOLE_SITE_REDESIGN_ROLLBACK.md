# cooperliang.top 全站夜间改版回滚说明

本次改版开始前已建立两个撤销点：

- 源码快照：`X:\codex\cooperliang-pre-redesign-20260825-110849.zip`
- Git 备份分支：`backup/cooperliang-pre-redesign-20260825-110849`

快照包含改版前的 `src` 目录及主要 Next.js / Tailwind / TypeScript 配置。备份分支指向改版开始时的提交 `dd15ee5`，不会包含当时已经存在的未提交工作。

## 本次改版修改的现有文件

- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/components/BlurText.tsx`
- `src/components/portfolio/DesignAnalysisSection.tsx`
- `src/components/portfolio/DesignChallengesSection.tsx`

## 本次改版新增的文件

- `PRODUCT.md`
- `DESIGN.md`（终稿设计系统记录）
- `.impeccable/design.json`（可渲染设计系统侧车记录）
- `src/components/NightBackdrop.tsx`
- `src/components/SiteHeader.tsx`
- `src/components/SiteFooter.tsx`
- `src/components/ui/animated-group.tsx`
- `src/components/ui/button.tsx`
- `.impeccable/` 下的设计说明与验收截图

## 推荐回滚方法：从快照精确恢复

1. 先关闭本地开发服务器。
2. 将 `X:\codex\cooperliang-pre-redesign-20260825-110849.zip` 解压到临时目录。
3. 从临时目录复制上述 6 个“修改的现有文件”，覆盖项目中的对应文件。
4. 删除上述“新增的文件”。
5. 运行 `npm install`（通常无需变更依赖）和 `npm run build` 验证恢复结果。

这个方法只撤销本次视觉改版，不会回退改版后你在其他文件中的工作。

## Git 对照方法

如需查看改版前版本，可运行：

```powershell
git diff backup/cooperliang-pre-redesign-20260825-110849 -- src/app src/components
```

由于改版开始时工作区已存在其他未提交文件，不建议直接执行 `git reset --hard` 或整仓 `git checkout`。优先使用源码快照逐文件恢复。
