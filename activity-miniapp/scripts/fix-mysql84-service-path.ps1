# 修复 MySQL84 服务：显式指定 --defaults-file，否则会使用不存在的默认 data 目录导致服务无法启动。
# 需「以管理员身份运行」PowerShell 后执行：
#   powershell -ExecutionPolicy Bypass -File "x:\A\1\activity-miniapp\scripts\fix-mysql84-service-path.ps1"

$binPath = '"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.4\my.ini" MySQL84'
$regPath = 'HKLM:\SYSTEM\CurrentControlSet\Services\MySQL84'

if (-not (Test-Path $regPath)) {
    Write-Error "注册表中不存在服务 MySQL84：$regPath"
    exit 1
}

try {
    Set-ItemProperty -Path $regPath -Name ImagePath -Value $binPath -Type ExpandString -ErrorAction Stop
} catch {
    Write-Error ("写入注册表失败（请右键 PowerShell → 以管理员身份运行后再执行本脚本）：" + $_)
    exit 1
}
Write-Host "已更新 ImagePath 为：" $binPath
Write-Host "请执行: Start-Service MySQL84"
