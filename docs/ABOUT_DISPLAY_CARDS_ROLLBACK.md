# About 页技能/爱好 DisplayCards 回滚

## 功能开关

在 `.env.local` 或 CI 环境变量中设置：

```
NEXT_PUBLIC_ABOUT_DISPLAY_CARDS=false
```

重新 `npm run build` 并部署后，关于页「核心技能」「爱好」恢复为玻璃拟态列表（`AboutSkillsHobbiesLegacy`）。

默认（未设置或 `true`）：使用**单区块 9 卡叠放**（5 项技能 + 4 项爱好），点击卡片升起并完整展示内容。

## 文件对照

| 新实现 | 旧实现（回滚用） |
|--------|------------------|
| `src/components/about/AboutSkillsHobbiesDisplayCards.tsx` | `src/components/about/AboutSkillsHobbiesLegacy.tsx` |
| `src/components/ui/display-cards.tsx` | — |

## Git 回滚

```powershell
cd X:\A\1
git log --oneline -3
git revert <commit_sha>
git push origin main
```
