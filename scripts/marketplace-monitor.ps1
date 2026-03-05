# Marketplace Monitor for Valencia Construction - Chicago
# Scans Thumbtack, Angi, HomeAdvisor public pages via Brave Search API

param(
    [string]$SeenFile = "C:\Users\trisd\clawd\data\marketplace-seen.json",
    [string]$OutputFile = "C:\Users\trisd\clawd\data\marketplace-leads-latest.json"
)

$ErrorActionPreference = "Stop"

$apiKey = 'BSAiCfCd972hBSaOFtD3URXDybJrHZu'
$baseUrl = 'https://api.search.brave.com/res/v1/web/search'

# Search queries for marketplace project pages
$queries = @(
    'site:thumbtack.com "chicago" "remodeling" OR "handyman" OR "painting"',
    'site:thumbtack.com "chicago" "bathroom" OR "kitchen" "remodel"',
    'site:thumbtack.com "chicago" "drywall" OR "flooring" OR "tile"',
    'site:angi.com "chicago" "contractor" OR "remodel" request',
    'site:angi.com "chicago" "handyman" OR "painting" OR "flooring"',
    'site:homeadvisor.com "chicago" "remodeling" OR "handyman"',
    'site:homeadvisor.com "chicago" "bathroom" OR "kitchen" renovation'
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

                # Generate stable key from URL
                $urlKey = $url -replace 'https?://', '' -replace '[^a-zA-Z0-9]', '_'

                # Skip if already seen
                if ($seen.ContainsKey($urlKey)) { continue }

                # Determine source platform
                $platform = "Marketplace"
                if ($url -match 'thumbtack\.com') { $platform = "Thumbtack" }
                elseif ($url -match 'angi\.com') { $platform = "Angi" }
                elseif ($url -match 'homeadvisor\.com') { $platform = "HomeAdvisor" }

                $seen[$urlKey] = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

                $snippet = $description
                if ($snippet.Length -gt 200) { $snippet = $snippet.Substring(0, 200) + "..." }

                $newPosts += [PSCustomObject]@{
                    id       = $urlKey
                    title    = $title
                    url      = $url
                    date     = (Get-Date).ToString("yyyy-MM-dd")
                    source   = $platform
                    snippet  = if ($snippet) { $snippet } else { $title }
                }

                Write-Host "  NEW [$platform]: $title" -ForegroundColor Green
            }
        } else {
            Write-Host "  No results" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "  API Error: $_" -ForegroundColor Red
    }

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

Write-Host "`nDone. $($newPosts.Count) new marketplace leads found." -ForegroundColor Cyan

# Auto-integrate leads into Mission Control dashboard
if ($newPosts.Count -gt 0) {
    $pythonExe = "C:\Users\trisd\AppData\Local\Programs\Python\Python312\python.exe"
    $integrator = "C:\Users\trisd\clawd\scripts\integrate-scanner-leads.py"
    if (Test-Path $integrator) {
        Write-Host "Integrating leads into Mission Control..." -ForegroundColor Yellow
        & $pythonExe $integrator --source marketplace
    }
}
