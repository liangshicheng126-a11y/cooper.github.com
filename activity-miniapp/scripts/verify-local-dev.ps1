# scripts/verify-local-dev.ps1 - local smoke check (backend: cd backend && npm run dev)
$ErrorActionPreference = "Continue"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$backendDir = Join-Path $root "backend"

Write-Host ""
Write-Host "=== activity-miniapp local verify ===" -ForegroundColor Cyan

try {
  $r = Invoke-RestMethod -Uri "http://localhost:3000/api/activities?page=1&size=1" -TimeoutSec 5
  if ($r.code -eq 0) {
    $n = @($r.data.list).Count
    Write-Host "[OK] GET /api/activities - $n item(s)" -ForegroundColor Green
  } else {
    Write-Host "[FAIL] GET /api/activities - code=$($r.code)" -ForegroundColor Red
  }
} catch {
  Write-Host "[FAIL] Backend not running. Run: cd backend; npm run dev" -ForegroundColor Red
  Write-Host "      $($_.Exception.Message)" -ForegroundColor Yellow
  exit 1
}

$redis = redis-cli ping 2>$null
if ($redis -eq "PONG") {
  Write-Host "[OK] Redis PONG" -ForegroundColor Green
} else {
  Write-Host "[WARN] Redis not running (checkin minicode may 503)" -ForegroundColor Yellow
}

$mysqlPaths = @(
  "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe",
  "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
)
$mysql = $mysqlPaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($mysql) {
  $cols = & $mysql -u root activity_miniapp -N -e "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='activity_miniapp' AND TABLE_NAME='activities' AND COLUMN_NAME IN ('moderation_status','wx_group_chat_name');" 2>$null
  if ($cols -eq "2") {
    Write-Host "[OK] DB columns moderation_status, wx_group_chat_name" -ForegroundColor Green
  } else {
    Write-Host "[WARN] Run database/migrate-all.sql" -ForegroundColor Yellow
  }
}

$envFile = Join-Path $backendDir ".env"
if (Test-Path $envFile) {
  $envText = Get-Content $envFile -Raw
  foreach ($key in @("AUTO_APPROVE_ACTIVITY_PUBLISH", "WX_MINI_ENV_VERSION", "CHECKIN_QR_MODE")) {
    if ($envText -match $key) {
      Write-Host "[OK] .env has $key" -ForegroundColor Green
    } else {
      Write-Host "[WARN] .env missing $key" -ForegroundColor Yellow
    }
  }
}

Write-Host ""
Write-Host "--- WeChat DevTools (manual) ---" -ForegroundColor Cyan
Write-Host "1. Import project folder: $root"
Write-Host "2. Settings: disable URL/domain check for localhost"
Write-Host "3. Test: Discover -> Publish -> Admin list -> Check-in QR"
Write-Host ""
