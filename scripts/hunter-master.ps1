# Hunter Master Script - Runs all lead generation tasks
# Call this from Windows Task Scheduler at intervals

param(
    [string]$Task = "all",  # "craigslist", "facebook", "reddit", "nextdoor", "outreach", "follow-up", "all"
    [switch]$Silent = $false
)

$ErrorActionPreference = "Continue"
$WorkDir = "C:\Users\trisd\clawd"
$PythonExe = "C:\Users\trisd\AppData\Local\Programs\Python\Python312\python.exe"
$LogDir = "$WorkDir\logs\hunter"

# Ensure log dir exists
if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

function Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMsg = "[$timestamp] $Message"
    Add-Content -Path "$LogDir\hunter.log" -Value $logMsg -Encoding UTF8
    if (!$Silent) { Write-Host $logMsg }
}

function Run-Craigslist {
    Log "=== CRAIGSLIST SCAN ==="
    try {
        Push-Location $WorkDir
        & powershell -ExecutionPolicy Bypass -File "$WorkDir\scripts\craigslist-monitor.ps1"
        Log "✓ Craigslist scan complete"
    }
    catch {
        Log "✗ Craigslist scan failed: $_"
    }
    finally {
        Pop-Location
    }
}

function Run-Facebook {
    Log "=== FACEBOOK SCAN ==="
    try {
        Push-Location $WorkDir
        if (Test-Path "$WorkDir\scripts\facebook-scan-advanced.py") {
            & $PythonExe "$WorkDir\scripts\facebook-scan-advanced.py"
        } else {
            Log "⚠ facebook-scan-advanced.py not found, skipping"
        }
        & $PythonExe "$WorkDir\scripts\integrate-scanner-leads.py" --source facebook
        Log "✓ Facebook scan complete"
    }
    catch {
        Log "✗ Facebook scan failed: $_"
    }
    finally {
        Pop-Location
    }
}

function Run-Reddit {
    Log "=== REDDIT SCAN ==="
    try {
        Push-Location $WorkDir
        if (Test-Path "$WorkDir\scripts\reddit-scan.py") {
            & $PythonExe "$WorkDir\scripts\reddit-scan.py"
        } else {
            Log "⚠ reddit-scan.py not found, skipping"
        }
        & $PythonExe "$WorkDir\scripts\integrate-scanner-leads.py" --source reddit
        Log "✓ Reddit scan complete"
    }
    catch {
        Log "✗ Reddit scan failed: $_"
    }
    finally {
        Pop-Location
    }
}

function Run-Nextdoor {
    Log "=== NEXTDOOR SCAN ==="
    try {
        Push-Location $WorkDir
        if (Test-Path "$WorkDir\scripts\nextdoor-scan.py") {
            & $PythonExe "$WorkDir\scripts\nextdoor-scan.py"
        } else {
            Log "⚠ nextdoor-scan.py not found, skipping"
        }
        & $PythonExe "$WorkDir\scripts\integrate-scanner-leads.py" --source nextdoor
        Log "✓ Nextdoor scan complete"
    }
    catch {
        Log "✗ Nextdoor scan failed: $_"
    }
    finally {
        Pop-Location
    }
}

function Run-Outreach {
    Log "=== DAILY OUTREACH PACKAGE ==="
    # This would be handled by a separate script, for now just log
    Log "⏳ Outreach package generation (TODO: wire up to Python script)"
}

function Run-FollowUp {
    Log "=== FOLLOW-UP CHECK ==="
    # This would be handled by a separate script, for now just log
    Log "⏳ Follow-up check (TODO: wire up to Python script)"
}

# Main execution
Log "Hunter starting - Task: $Task"

switch ($Task) {
    "craigslist" { Run-Craigslist }
    "facebook"   { Run-Facebook }
    "reddit"     { Run-Reddit }
    "nextdoor"   { Run-Nextdoor }
    "outreach"   { Run-Outreach }
    "follow-up"  { Run-FollowUp }
    "all" {
        Run-Craigslist
        Start-Sleep -Seconds 5
        Run-Facebook
        Start-Sleep -Seconds 5
        Run-Reddit
        Start-Sleep -Seconds 5
        Run-Nextdoor
        Start-Sleep -Seconds 5
        Run-Outreach
        Run-FollowUp
    }
}

Log "Hunter done."
