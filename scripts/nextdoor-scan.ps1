# Nextdoor Lead Scanner for Valencia Construction - Chicago
# Uses Brave Search API to find Nextdoor posts about contractor needs

param(
    [string]$SeenFile = "C:\Users\trisd\clawd\data\nextdoor-seen.json",
    [string]$OutputFile = "C:\Users\trisd\clawd\data\nextdoor-leads-latest.json"
)

$ErrorActionPreference = "Stop"

$apiKey = 'BSAiCfCd972hBSaOFtD3URXDybJrHZu'
$baseUrl = 'https://api.search.brave.com/res/v1/web/search'

# Search queries targeting Nextdoor posts
$queries = @(
    'site:nextdoor.com "chicago" "contractor" "looking for"',
    'site:nextdoor.com "chicago" "remodel" "recommend"',
    'site:nextdoor.com "chicago" "handyman" "need"',
    'site:nextdoor.com "chicago" "kitchen" OR "bathroom" "renovation"',
    'site:nextdoor.com "chicago" "painter" OR "plumber" "recommend"',
    'site:nextdoor.com "chicago" "does anyone know" "contractor"',
    'site:nextdoor.com "chicago" "drywall" OR "flooring" OR "tile"',
    'site:nextdoor.com "chicago" "deck" OR "fence" "repair" OR "build"'
)

$headers = @{
    'Accept' = 'application/json'
    'X-Subscription-Token' = $apiKey
}

# Load seen URLs
$seen = @{}
if (Test-Path $SeenFile) {
    $seenData = Get-Content $SeenFile -Raw | ConvertFrom-Json
    foreach ($prop in $seenData.PSObject.Properties) {
        $seen[$prop.Name] = $prop.Value
    }
}

$newPosts = @()
$queryCount = 0

foreach ($query in $queries) {
    $queryCount++
    Write-Host "Query $queryCount/$($queries.Count): $($query.Substring(0, [Math]::Min(60, $query.Length)))..." -ForegroundColor Cyan

    try {
        $uri = $baseUrl + '?q=' + [System.Net.WebUtility]::UrlEncode($query) + '&count=20'
        $response = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get -TimeoutSec 10

        if ($response.web -and $response.web.results) {
            foreach ($result in $response.web.results) {
                $url = $result.url
                $title = $result.title
                $description = $result.description

                # Generate a stable key from URL
                $urlKey = $url -replace 'https?://', '' -replace '[^a-zA-Z0-9]', '_'

                # Skip if already seen
                if ($seen.ContainsKey($urlKey)) { continue }

                # Must actually be a Nextdoor page
                if ($url -notmatch 'nextdoor\.com') { continue }

                $seen[$urlKey] = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

                $snippet = $description
                if ($snippet.Length -gt 200) { $snippet = $snippet.Substring(0, 200) + "..." }

                $newPosts += [PSCustomObject]@{
                    id      = $urlKey
                    title   = $title
                    url     = $url
                    date    = (Get-Date).ToString("yyyy-MM-dd")
                    source  = "Nextdoor"
                    snippet = if ($snippet) { $snippet } else { $title }
                }

                Write-Host "  NEW: $title" -ForegroundColor Green
            }
        } else {
            Write-Host "  No results" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "  API Error: $_" -ForegroundColor Red
    }

    # Rate limit - 500ms between queries
    Start-Sleep -Milliseconds 500
}

# Save seen URLs
$seen | ConvertTo-Json -Depth 5 | Set-Content $SeenFile -Encoding UTF8

# Output results
$result = [PSCustomObject]@{
    timestamp     = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    newPostsCount = $newPosts.Count
    posts         = $newPosts
}

$json = $result | ConvertTo-Json -Depth 5
$json | Set-Content $OutputFile -Encoding UTF8

Write-Host "`nDone. $($newPosts.Count) new Nextdoor leads found." -ForegroundColor Cyan

# Auto-integrate leads into Mission Control dashboard
if ($newPosts.Count -gt 0) {
    $pythonExe = "C:\Users\trisd\AppData\Local\Programs\Python\Python312\python.exe"
    $integrator = "C:\Users\trisd\clawd\scripts\integrate-scanner-leads.py"
    if (Test-Path $integrator) {
        Write-Host "Integrating leads into Mission Control..." -ForegroundColor Yellow
        & $pythonExe $integrator --source nextdoor
    }
}
