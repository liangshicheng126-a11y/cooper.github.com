#!/usr/bin/env bash
# 在 Ubuntu 22.04+ 云服务器上一次性初始化（需 root）
# 用法：sudo bash deploy/bootstrap-server.sh
set -euo pipefail

APP_ROOT="${APP_ROOT:-/var/www/activity-miniapp}"
DOMAIN="${DOMAIN:-api.cooperliang.top}"
DB_NAME="${DB_NAME:-activity_miniapp}"
DB_USER="${DB_USER:-activity_app}"
DB_PASS="${DB_PASS:-$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)}"

echo "==> 安装系统依赖"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y curl git nginx certbot python3-certbot-nginx \
  mysql-server redis-server ufw

echo "==> 安装 Node.js 20"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "==> 安装 PM2"
npm install -g pm2

echo "==> 配置 MySQL"
mysql -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
mysql -e "GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
echo "MySQL 用户: ${DB_USER}  密码: ${DB_PASS}  （请写入 backend/.env 的 DB_PASSWORD）"

echo "==> 启用 Redis"
systemctl enable --now redis-server

echo "==> 防火墙"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> 创建应用目录 ${APP_ROOT}"
mkdir -p "${APP_ROOT}" /var/www/certbot
chown -R "${SUDO_USER:-root}:${SUDO_USER:-root}" "${APP_ROOT}" 2>/dev/null || true

echo "==> Nginx 站点配置"
if [ -f "${APP_ROOT}/deploy/nginx.api.cooperliang.top.conf" ]; then
  cp "${APP_ROOT}/deploy/nginx.api.cooperliang.top.conf" "/etc/nginx/sites-available/${DOMAIN}"
else
  echo "警告：未找到 ${APP_ROOT}/deploy/nginx.api.cooperliang.top.conf，请先上传代码"
fi
ln -sf "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  服务器基础环境已就绪"
echo ""
echo "  下一步："
echo "  1. DNS 添加 A 记录：api → 本机公网 IP"
echo "  2. 上传代码到 ${APP_ROOT}（git clone 或 rsync）"
echo "  3. cp deploy/env.production.example backend/.env 并填写密钥"
echo "  4. mysql ... < database/schema.sql && migrate-all.sql"
echo "  5. cd backend && npm ci --omit=dev"
echo "  6. bash deploy/release.sh"
echo "  7. sudo certbot --nginx -d ${DOMAIN}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
