@echo off
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((Get-Content -LiteralPath '%~f0' -Raw -Encoding UTF8) -split '#PSSTART#\r?\n' | Select-Object -Last 1)"
if errorlevel 1 (
  echo.
  echo   PowerShell 执行失败，请把上面的报错截图发给我。
  pause
)
exit /b

#PSSTART#
$ErrorActionPreference = 'Continue'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
try { $Host.UI.RawUI.WindowTitle = '博客一键发布' } catch {}

$repo = 'D:\Blog'
if ($env:BLOG_REPO) { $repo = $env:BLOG_REPO }
if (-not (Test-Path -LiteralPath $repo)) { $repo = (Get-Location).Path }
Set-Location -LiteralPath $repo

$site    = 'https://map1e-suk1.github.io/'
$actions = 'https://github.com/Map1e-Suk1/Map1e-Suk1.github.io/actions'

function Write-Step { param([string]$Number, [string]$Text)
  Write-Host ''
  Write-Host ("  [$Number] ") -ForegroundColor DarkCyan -NoNewline
  Write-Host $Text -ForegroundColor White
}
function Write-Ok   { param([string]$Text) Write-Host ("         ✓ " + $Text) -ForegroundColor Green }
function Write-Warn { param([string]$Text) Write-Host ("         ! " + $Text) -ForegroundColor Yellow }
function Write-Bad  { param([string]$Text) Write-Host ("         ✗ " + $Text) -ForegroundColor Red }
function Write-Info { param([string]$Text) Write-Host ("         " + $Text) -ForegroundColor DarkGray }
function Wait-End   {
  param([string]$Prompt = '  按回车关闭窗口')
  if ($env:BLOG_NOPAUSE) { return }
  try { Read-Host $Prompt | Out-Null } catch {}
}

Write-Host ''
Write-Host '  ─────────────────────────────────────────────────────' -ForegroundColor DarkCyan
Write-Host '        博 客 一 键 发 布   ·   Map1e-Suk1' -ForegroundColor Cyan
Write-Host '  ─────────────────────────────────────────────────────' -ForegroundColor DarkCyan

# ---------- 环境检查 ----------
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host ''
  Write-Bad '找不到 git 命令，请先安装 Git for Windows：https://git-scm.com/download/win'
  Wait-End
  return
}
if (-not (Test-Path -LiteralPath (Join-Path $repo 'src\config.ts'))) {
  Write-Host ''
  Write-Bad ('这个目录不是博客项目：' + $repo)
  Wait-End
  return
}
if (-not (git config user.name))  { git config user.name  'Map1e-Suk1' | Out-Null }
if (-not (git config user.email)) { git config user.email 'Map1e-Suk1@users.noreply.github.com' | Out-Null }

# 自动识别系统代理（Clash / v2rayN 等），让 git 也能连上 GitHub
$sysProxy = $null
try {
  $reg = Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -ErrorAction SilentlyContinue
  if ($reg -and $reg.ProxyEnable -eq 1 -and $reg.ProxyServer) {
    $raw = [string]$reg.ProxyServer
    if ($raw -match '=') {
      $m = [regex]::Match($raw, 'https?=([^;]+)')
      if ($m.Success) { $raw = $m.Groups[1].Value }
    }
    if ($raw) {
      if ($raw -notmatch '^[a-zA-Z]+://') { $raw = 'http://' + $raw }
      $sysProxy = $raw
      $env:HTTP_PROXY  = $raw
      $env:HTTPS_PROXY = $raw
      $env:http_proxy  = $raw
      $env:https_proxy = $raw
    }
  }
} catch {}

# ---------- 1 检查改动 ----------
Write-Step '1/4' '检查改动'
$status = @(git -c core.quotepath=false status --porcelain)
if ($status.Count -eq 0) {
  Write-Ok '没有任何改动，不需要发布。'
  Write-Host ''
  Write-Info ('博客地址： ' + $site)
  Write-Host ''
  Wait-End
  return
}
Write-Info ('发现 ' + $status.Count + ' 处改动：')
foreach ($item in $status) { Write-Host ('           ' + $item) -ForegroundColor DarkGray }

# ---------- 2 输入 ----------
Write-Step '2/4' '输入这次更新了什么内容'
$defaultMsg = 'update: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm')
Write-Info ('直接回车就用默认： ' + $defaultMsg)
Write-Host '         > ' -ForegroundColor Cyan -NoNewline
$msg = Read-Host
if ([string]::IsNullOrWhiteSpace($msg)) { $msg = $defaultMsg }

# ---------- 3 提交 + 推送 ----------
Write-Step '3/4' '提交并推送'
git add -A
$msgFile = Join-Path $env:TEMP ('blog-commit-' + [guid]::NewGuid().ToString('N') + '.txt')
[System.IO.File]::WriteAllText($msgFile, $msg, (New-Object System.Text.UTF8Encoding($false)))
git commit -q -F $msgFile
$commitCode = $LASTEXITCODE
Remove-Item $msgFile -ErrorAction SilentlyContinue

if ($commitCode -ne 0) {
  Write-Bad '提交失败，把上面的报错发给我看看。'
  Wait-End
  return
}
$hash = (git log -1 --format='%h')
Write-Ok ('已提交  ' + $hash + '   ' + $msg)

if ($sysProxy) { Write-Info ('走系统代理： ' + $sysProxy) }
Write-Host '         正在推送到 GitHub……' -ForegroundColor DarkGray
$pushLog = git push origin main 2>&1
$pushCode = $LASTEXITCODE
foreach ($line in $pushLog) {
  if ($line -is [System.Management.Automation.ErrorRecord]) { $t = $line.Exception.Message } else { $t = [string]$line }
  Write-Host ('           ' + $t) -ForegroundColor DarkGray
}

if ($pushCode -ne 0) {
  Write-Warn '推送失败，改动只提交到了本地（内容没丢）。'
  Write-Info '多半是网络问题：把代理打开再运行一次这个脚本就行。'
  Write-Info '如果提示 non-fast-forward，先在 D:\Blog 执行 git pull --rebase 再试。'
} else {
  Write-Ok ('已推送  ' + $hash + '  →  origin/main')
}

# ---------- 4 完成 ----------
Write-Step '4/4' '完成'
Write-Info '约 1 分钟后自动上线：'
Write-Host ('           ' + $site) -ForegroundColor Cyan
Write-Info '部署进度（绿勾 = 成功）：'
Write-Host ('           ' + $actions) -ForegroundColor DarkGray

Write-Host ''
Write-Host '  接下来：[回车] 关闭      [o] 打开博客      [p] 本地预览' -ForegroundColor Cyan
Write-Host '         > ' -ForegroundColor Cyan -NoNewline
$next = Read-Host
if ($next -eq 'o' -or $next -eq 'O') {
  Start-Process $site
} elseif ($next -eq 'p' -or $next -eq 'P') {
  Write-Host ''
  if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    Write-Info '本地预览地址： http://localhost:4321    （按 Ctrl+C 停止）'
    Write-Host ''
    pnpm dev
  } else {
    Write-Warn '没找到 pnpm，跳过本地预览。'
  }
}
