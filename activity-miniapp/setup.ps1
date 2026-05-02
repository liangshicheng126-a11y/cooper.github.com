# setup.ps1 - Windows 开发环境一键检查 & 初始化脚本
# 使用方法：在 PowerShell 中执行  .\setup.ps1
# ──────────────────────────────────────────────────

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  活动报名小程序 - 环境初始化脚本" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# ── 1. 检查 Node.js ──────────────────────────────────
Write-Host "[ 1/5 ] 检查 Node.js..." -ForegroundColor Yellow
$nodeVer = node --version 2>$null
if ($nodeVer) {
    Write-Host "  ✅ Node.js $nodeVer" -ForegroundColor Green
} else {
    Write-Host "  ❌ 未检测到 Node.js，请先安装：https://nodejs.org" -ForegroundColor Red
    exit 1
}

# ── 2. 检查 MySQL ────────────────────────────────────
Write-Host "[ 2/5 ] 检查 MySQL..." -ForegroundColor Yellow
$mysqlPaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\wamp64\bin\mysql\mysql8.0.31\bin\mysql.exe"
)
$mysqlExe = $null
foreach ($p in $mysqlPaths) {
    if (Test-Path $p) { $mysqlExe = $p; break }
}
if (-not $mysqlExe) {
    $mysqlExe = (Get-Command mysql -ErrorAction SilentlyContinue)?.Source
}
if ($mysqlExe) {
    Write-Host "  ✅ MySQL 找到：$mysqlExe" -ForegroundColor Green
} else {
    Write-Host "  ❌ 未检测到 MySQL" -ForegroundColor Red
    Write-Host "  请从以下地址下载安装（推荐 MySQL Installer）：" -ForegroundColor Yellow
    Write-Host "  https://dev.mysql.com/downloads/installer/" -ForegroundColor Cyan
    Write-Host "  安装时选择 'Developer Default'，记住设置的 root 密码" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  如已安装但未找到，请手动执行数据库初始化（见文档）" -ForegroundColor Yellow
}

# ── 3. 检查 Redis ────────────────────────────────────
Write-Host "[ 3/5 ] 检查 Redis..." -ForegroundColor Yellow
$redisPong = redis-cli ping 2>$null
if ($redisPong -eq "PONG") {
    Write-Host "  ✅ Redis 已运行" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Redis 未运行（开发阶段可暂时跳过，缓存功能会降级）" -ForegroundColor Yellow
    Write-Host "  推荐安装 Memurai（Windows Redis）：https://www.memurai.com/" -ForegroundColor Cyan
}

# ── 4. 初始化数据库 ──────────────────────────────────
Write-Host "[ 4/5 ] 初始化数据库..." -ForegroundColor Yellow
if ($mysqlExe) {
    Write-Host "  请输入 MySQL root 密码（留空则直接回车）：" -ForegroundColor Yellow
    $mysqlPwd = Read-Host "  MySQL root 密码" -AsSecureString
    $plainPwd = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPwd)
    )
    $schemaPath = Join-Path $root "database\schema.sql"
    if ($plainPwd) {
        & $mysqlExe -u root -p"$plainPwd" -e "source $schemaPath" 2>&1
    } else {
        & $mysqlExe -u root -e "source $schemaPath" 2>&1
    }
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ 数据库初始化成功" -ForegroundColor Green
        # 将密码写入 .env
        $envPath = Join-Path $root "backend\.env"
        (Get-Content $envPath) -replace "^DB_PASSWORD=.*", "DB_PASSWORD=$plainPwd" |
            Set-Content $envPath
        Write-Host "  ✅ 数据库密码已写入 backend\.env" -ForegroundColor Green
    } else {
        Write-Host "  ❌ 数据库初始化失败，请检查密码或手动执行 schema.sql" -ForegroundColor Red
    }
} else {
    Write-Host "  ⏭  跳过（MySQL 未找到）" -ForegroundColor Gray
}

# ── 5. 安装后端依赖 ──────────────────────────────────
Write-Host "[ 5/5 ] 检查后端依赖..." -ForegroundColor Yellow
$backendDir = Join-Path $root "backend"
$nodeModules = Join-Path $backendDir "node_modules"
if (Test-Path $nodeModules) {
    Write-Host "  ✅ 依赖已安装" -ForegroundColor Green
} else {
    Write-Host "  正在安装依赖..." -ForegroundColor Yellow
    Push-Location $backendDir
    npm install
    Pop-Location
}

# ── 完成 ─────────────────────────────────────────────
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  下一步：" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. 编辑 backend\.env 填写微信/腾讯云密钥" -ForegroundColor White
Write-Host "  2. 启动后端：cd backend && npm run dev" -ForegroundColor White
Write-Host "  3. 编辑 miniprogram\utils\config.js 填写 AppID 和 Key" -ForegroundColor White
Write-Host "  4. 用微信开发者工具打开 miniprogram\ 目录" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
