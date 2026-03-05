# Start Mission Control as a background job that survives terminal close
$logFile = "C:\Users\trisd\clawd\mission-control\server.log"
$npmPath = (Get-Command npm).Source -replace 'npm$','npm.cmd' -replace 'npm.ps1$','npm.cmd'
if (-not (Test-Path $npmPath)) { $npmPath = "C:\Program Files\nodejs\npm.cmd" }
$proc = Start-Process -FilePath $npmPath -ArgumentList "run","dev" -WorkingDirectory "C:\Users\trisd\clawd\mission-control" -WindowStyle Hidden -RedirectStandardOutput $logFile -RedirectStandardError "$logFile.err" -PassThru
$proc.Id | Out-File "C:\Users\trisd\clawd\mission-control\server.pid" -Force
Write-Host "Mission Control started (PID: $($proc.Id)) → http://localhost:3000"
