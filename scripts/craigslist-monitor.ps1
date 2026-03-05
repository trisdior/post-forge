# Craigslist Monitor for Valencia Construction - Chicago
# Uses Craigslist SAPI (structured JSON API) instead of HTML scraping
# Searches household services for contractor leads

param(
    [string]$SeenFile = "C:\Users\trisd\clawd\data\craigslist-seen.json",
    [string]$OutputFile = ""
)

$ErrorActionPreference = "Stop"

# Keywords to match
$keywords = @('contractor','remodel','kitchen','bathroom','handyman','renovation',
              'flooring','painting','drywall','plumbing','tile','basement','deck',
              'repair','fix','renovate','cabinet','countertop','fence','roof','gutter',
              'demolition','concrete','patio','porch','siding','window','door',
              'electrical','wiring','outlet','water heater','sump','drain')

$keywordPattern = ($keywords | ForEach-Object { [regex]::Escape($_) }) -join '|'

# SAPI endpoints - area 11 = Chicago
$sapiBase = "https://sapi.craigslist.org/web/v8/postings/search/full"
$sections = @(
    @{ path = "hss"; name = "Household Services"; batch = "11-0-360-1-0" }
)

$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    "Accept" = "application/json"
}

# Load seen IDs
$seen = @{}
if (Test-Path $SeenFile) {
    $seenData = Get-Content $SeenFile -Raw | ConvertFrom-Json
    foreach ($prop in $seenData.PSObject.Properties) {
        $seen[$prop.Name] = $prop.Value
    }
}

$newPosts = @()

foreach ($section in $sections) {
    $sectionPath = $section.path
    $sectionName = $section.name
    $batch = $section.batch

    Write-Host "Scanning: $sectionName ($sectionPath) via SAPI..." -ForegroundColor Cyan

    try {
        $uri = "$sapiBase`?batch=$batch&cc=US&lang=en&search_distance=30&postal=60601&searchPath=$sectionPath"
        $response = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get -TimeoutSec 30

        $items = $response.data.items
        $locations = $response.data.decode.locations
        # SAPI uses offset IDs — real posting ID = minPostingId + item[0]
        $minPostingId = [long]$response.data.decode.minPostingId

        if (-not $items -or $items.Count -eq 0) {
            Write-Host "  No items returned" -ForegroundColor Yellow
            continue
        }

        Write-Host "  Found $($items.Count) listings (minPostingId: $minPostingId)" -ForegroundColor Gray

        foreach ($item in $items) {
            # Parse SAPI item array:
            # [0] = offset from minPostingId (real ID = minPostingId + offset)
            # [4] = location string "1:idx~lat~lng"
            # [-1] = title (last element)
            # Find [6, 'slug'] element for URL construction

            $offset = [long]$item[0]
            $realPostId = ($minPostingId + $offset).ToString()
            $title = $item[$item.Count - 1]

            if (-not $title -or $title -isnot [string]) { continue }

            # Check keyword match
            if ($title -notmatch $keywordPattern) { continue }

            # Check if already seen
            if ($seen.ContainsKey($realPostId)) { continue }

            # Find slug for URL
            $slug = ""
            foreach ($elem in $item) {
                if ($elem -is [System.Collections.IList] -and $elem.Count -eq 2 -and $elem[0] -eq 6) {
                    $slug = $elem[1]
                    break
                }
            }

            # Parse location/subarea from location string
            $subarea = "chc"  # default to chicago city
            $locStr = ""
            if ($item.Count -gt 4 -and $item[4] -is [string] -and $item[4] -match ':') {
                $locParts = $item[4] -split ':'
                $locIdx = [int]($locParts[1] -split '~')[0]
                if ($locIdx -gt 0 -and $locIdx -lt $locations.Count) {
                    $locEntry = $locations[$locIdx]
                    if ($locEntry -is [System.Collections.IList] -and $locEntry.Count -ge 3) {
                        $subarea = $locEntry[2]
                    }
                }
            }

            # Build URL with real posting ID
            $postUrl = "https://chicago.craigslist.org/$subarea/$sectionPath/d/$slug/$realPostId.html"

            $seen[$realPostId] = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

            $newPosts += [PSCustomObject]@{
                id      = $realPostId
                title   = $title
                url     = $postUrl
                date    = (Get-Date).ToString("yyyy-MM-dd")
                source  = "Craigslist"
                snippet = $title.Substring(0, [Math]::Min(200, $title.Length))
            }

            Write-Host "  NEW: $title" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "  SAPI Error: $_" -ForegroundColor Red
    }

    Start-Sleep -Seconds 2
}

# Save seen IDs
$seen | ConvertTo-Json -Depth 5 | Set-Content $SeenFile -Encoding UTF8

# Output results
$result = [PSCustomObject]@{
    timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    newPostsCount = $newPosts.Count
    posts = $newPosts
}

$json = $result | ConvertTo-Json -Depth 5

$defaultOutput = "C:\Users\trisd\clawd\data\craigslist-latest.json"
$targetFile = if ($OutputFile) { $OutputFile } else { $defaultOutput }
$json | Set-Content $targetFile -Encoding UTF8
Write-Host "`nSaved $($newPosts.Count) new posts to $targetFile" -ForegroundColor Yellow

Write-Host "`nDone. $($newPosts.Count) new matching posts found." -ForegroundColor Cyan

# Auto-integrate leads into Mission Control dashboard
if ($newPosts.Count -gt 0) {
    $pythonExe = "C:\Users\trisd\AppData\Local\Programs\Python\Python312\python.exe"
    $integrator = "C:\Users\trisd\clawd\scripts\integrate-scanner-leads.py"
    if (Test-Path $integrator) {
        Write-Host "Integrating leads into Mission Control..." -ForegroundColor Yellow
        & $pythonExe $integrator --source craigslist
    }
}
