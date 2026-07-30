# 小coo Cloudflare Worker

流式聊天代理：注入 `content/xiaocoo` 知识库，转发 DeepSeek（OpenAI 兼容）SSE。  
每轮对话结束后可推送到 **Telegram** 或 **飞书**（手机通知看访客问了什么、小coo 回了什么）。

## 部署

```bash
# 从仓库根目录刷新知识库产物
node scripts/bundle-xiaocoo-kb.mjs

cd workers/xiaocoo
npm install
npx wrangler secret put DEEPSEEK_API_KEY
# 手机推送（至少配一种）
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
# 或飞书：
# npx wrangler secret put FEISHU_WEBHOOK_URL
npx wrangler deploy
```

部署后把 Worker URL 配到站点环境变量：

```bash
NEXT_PUBLIC_XIAOCOO_API_URL=https://xiaocoo-chat.<your-subdomain>.workers.dev
```

自定义域名示例：`api.cooperliang.top`（在 `wrangler.toml` 解开 routes 注释并配置 DNS）。

## Telegram 配置（推荐，系统级推送）

1. Telegram 找 `@BotFather` → `/newbot` → 拿到 token  
2. 先私聊你的 bot 发任意一条  
3. 浏览器打开：`https://api.telegram.org/bot<TOKEN>/getUpdates`，在结果里找 `"chat":{"id": 数字}`  
4. `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` 写入 Worker secrets / `.env.local`

## 飞书配置（备选）

群聊 → 设置 → 机器人 → 添加自定义机器人 → 复制 Webhook，设为 `FEISHU_WEBHOOK_URL`。

## 本地

```bash
cd workers/xiaocoo
npx wrangler dev
# 前端：NEXT_PUBLIC_XIAOCOO_API_URL=http://127.0.0.1:8787
```

或不启 Worker：在仓库根目录 `.env.local` 设 `DEEPSEEK_API_KEY` 与推送变量后 `npm run dev`，前端默认打 `/api/xiaocoo`。
