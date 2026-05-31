# 从 Windows 同步代码到云服务器（需 OpenSSH）
# 用法：
#   $env:DEPLOY_HOST = "root@你的服务器IP"
#   .\deploy\sync-to-server.ps1
param(
  [string]$Host = $env:DEPLOY_HOST,
  [string]$RemotePath = "/var/www/activity-miniapp"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

if (-not $Host) {
  Write-Host "请设置服务器 SSH 地址，例如：" -ForegroundColor Yellow
  Write-Host '  $env:DEPLOY_HOST = "ubuntu@123.45.67.89"' -ForegroundColor Cyan
  Write-Host "  .\deploy\sync-to-server.ps1" -ForegroundColor Cyan
  exit 1
}

$excludes = @(
  "node_modules",
  "backend/logs",
  "backend/uploads-dev",
  "backend/.env",
  "miniprogram/utils/config.local.js",
  ".git"
)

Write-Host "同步 $root -> ${Host}:${RemotePath}" -ForegroundColor Cyan

# rsync 在 Git for Windows / WSL 中可用；否则回退 scp 整目录（较慢）
$rsync = Get-Command rsync -ErrorAction SilentlyContinue
if ($rsync) {
  $excludeArgs = $excludes | ForEach-Object { "--exclude=$_" }
  & rsync -avz --delete @excludeArgs "$root/" "${Host}:${RemotePath}/"
} else {
  Write-Host "未找到 rsync，使用 scp（不含 node_modules）..." -ForegroundColor Yellow
  ssh $Host "mkdir -p $RemotePath"
  scp -r "$root\backend\src" "$root\backend\package.json" "$root\backend\package-lock.json" "${Host}:${RemotePath}/backend/"
  scp -r "$root\deploy" "$root\database" "${Host}:${RemotePath}/"
}

Write-Host ""
Write-Host "同步完成。在服务器上执行：" -ForegroundColor Green
Write-Host "  ssh $Host" -ForegroundColor White
Write-Host "  cd $RemotePath && bash deploy/release.sh" -ForegroundColor White
