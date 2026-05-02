@echo off
:: start-dev.bat - 一键启动所有开发服务
:: 双击此文件即可启动 MySQL、Redis 和后端
title 活动报名小程序 - 开发环境启动

echo.
echo  ████████████████████████████████████████████
echo   活动报名小程序 开发环境启动脚本
echo  ████████████████████████████████████████████
echo.

:: ─── 检查并启动 MySQL ──────────────────────────
echo [1/3] 检查 MySQL...
set MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.4\bin
set MYSQL_INI=C:\ProgramData\MySQL\MySQL Server 8.4\my.ini

"%MYSQL_BIN%\mysql.exe" -u root -e "SELECT 1;" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo      ✓ MySQL 已在运行
) else (
    echo      正在启动 MySQL...
    sc start MySQL84 >nul 2>&1
    timeout /t 3 /nobreak >nul
    "%MYSQL_BIN%\mysqld.exe" --defaults-file="%MYSQL_INI%" >nul 2>&1 &
    timeout /t 5 /nobreak >nul
    "%MYSQL_BIN%\mysql.exe" -u root -e "SELECT 1;" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (echo      ✓ MySQL 启动成功) else (echo      ✗ MySQL 启动失败，请检查)
)

:: ─── 检查并启动 Redis ──────────────────────────
echo [2/3] 检查 Redis...
set REDIS_BIN=C:\Program Files\Redis

"%REDIS_BIN%\redis-cli.exe" ping >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo      ✓ Redis 已在运行
) else (
    echo      正在启动 Redis...
    sc start Redis >nul 2>&1
    timeout /t 3 /nobreak >nul
    "%REDIS_BIN%\redis-cli.exe" ping >nul 2>&1
    if %ERRORLEVEL% EQU 0 (echo      ✓ Redis 启动成功) else (echo      ✗ Redis 启动失败，缓存降级)
)

:: ─── 启动后端服务 ──────────────────────────────
echo [3/3] 启动后端服务...
echo      后端日志将在新窗口显示
echo.

cd /d "%~dp0backend"
start "活动报名后端 :3000" cmd /k "npm run dev"

echo.
echo  ████████████████████████████████████████████
echo   ✓ 后端服务启动中，请在新窗口查看日志
echo   ✓ API 地址：http://localhost:3000
echo   ✓ 健康检查：http://localhost:3000/health
echo  ────────────────────────────────────────────
echo   下一步：打开微信开发者工具
echo   导入目录：%~dp0miniprogram
echo  ████████████████████████████████████████████
echo.
pause
