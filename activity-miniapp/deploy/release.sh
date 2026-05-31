#!/usr/bin/env bash
# 在服务器 activity-miniapp 根目录执行：bash deploy/release.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f backend/.env ]; then
  echo "错误：缺少 backend/.env，请先 cp deploy/env.production.example backend/.env 并填写"
  exit 1
fi

echo "==> 安装依赖"
cd backend
npm ci --omit=dev

echo "==> 数据库迁移（可选，首次或升级时）"
if command -v mysql >/dev/null 2>&1; then
  node src/utils/migrate.js 2>/dev/null || echo "（migrate.js 跳过或需手动执行 SQL）"
fi

echo "==> 重启 PM2"
mkdir -p logs
pm2 startOrReload "$ROOT/deploy/ecosystem.config.cjs" --update-env
pm2 save

echo "==> 健康检查"
sleep 2
curl -sf "http://127.0.0.1:3000/api/health" | head -c 200
echo ""
echo "✅ 本地健康检查通过。公网请访问 https://api.cooperliang.top/api/health"
