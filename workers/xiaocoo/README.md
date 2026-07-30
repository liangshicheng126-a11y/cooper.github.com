# 小coo Cloudflare Worker

流式聊天代理：注入 `content/xiaocoo` 知识库，转发 DeepSeek（OpenAI 兼容）SSE。

## 部署

```bash
# 从仓库根目录刷新知识库产物
node scripts/bundle-xiaocoo-kb.mjs

cd workers/xiaocoo
npm install
npx wrangler secret put DEEPSEEK_API_KEY
npx wrangler deploy
```

部署后把 Worker URL 配到站点环境变量：

```bash
NEXT_PUBLIC_XIAOCOO_API_URL=https://xiaocoo-chat.<your-subdomain>.workers.dev
```

自定义域名示例：`api.cooperliang.top`（在 `wrangler.toml` 解开 routes 注释并配置 DNS）。

## 本地

```bash
cd workers/xiaocoo
npx wrangler dev
# 前端：NEXT_PUBLIC_XIAOCOO_API_URL=http://127.0.0.1:8787
```

或不启 Worker：在仓库根目录设 `DEEPSEEK_API_KEY` 后 `npm run dev`，前端默认打 `/api/xiaocoo`。
