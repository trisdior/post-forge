# Reddit Lead Scanner for Valencia Construction - Chicago
# Scans local subreddits for contractor/remodel requests via public JSON API

param(
    [string]$SeenFile = "C:\Users\trisd\clawd\data\reddit-seen.json",
    [string]$OutputFile = "C:\Users\trisd\clawd\data\reddit-leads-latest.json"
)

$ErrorActionPreference = "Stop"

# Target subreddits
$subreddits = @(
    @{ name = "chicago"; requireLocation = $false },
    @{ name = "ChicagoSuburbs"; requireLocation = $false },
    @{ name = "HomeImprovement"; requireLocation = $true },
    @{ name = "homeowners"; requireLocation = $true }
)

# Construction keywords
$keywords = @('contractor','remodel','kitchen','bathroom','handyman','renovation',
              'flooring','painting','drywall','plumbing','tile','basement','deck',
              'repair','fix','renovate','cabinet','countertop','fence','roof','gutter')
$keywordPattern = ($keywords | ForEach-Object { [regex]::Escape($_) }) -join '|'

# Chicago location keywords (for non-local subs)
$locationKeywords = @('chicago','chicagoland','IL','illinois','evanston','oak park',
                      'naperville','schaumburg','arlington heights','skokie','cicero',
                      'berwyn','des plaines','mount prospect','palatine','elmhurst',
                      'lombard','wheaton','downers grove','aurora','joliet','waukegan',
                      'lincoln park','lakeview','logan square','wicker park','hyde park',
                      'pilsen','bridgeport','rogers park','edgewater','uptown')
$locationPattern = ($locationKeywords | ForEach-Object { [regex]::Escape($_) }) -join '|'

# Negative filters - skip these
$negativeKeywords = @('hiring','i am a contractor','my company','we offer','our services',
                      'free estimate','call us','visit our','www\.','\.com\/')
$negativePattern = ($negativeKeywords | ForEach-Object { $_ }) -join '|'

$headers = @{
    "User-Agent" = "Valencia-Lead-Scanner/1.0 (Windows; construction lead monitoring)"
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

foreach ($sub in $subreddits) {
    $subName = $sub.name
    Write-Host "Scanning r/$subName..." -ForegroundColor Cyan

    try {
        $uri = "https://www.reddit.com/r/$subName/new.json?limit=50"
        $response = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get -TimeoutSec 15

        $posts = $response.data.children
        Write-Host "  Fetched $($posts.Count) posts" -ForegroundColor Gray

        foreach ($post in $posts) {
            $data = $post.data
            $postId = $data.id
            $title = $data.title
            $selftext = $data.selftext
            $permalink = "https://www.reddit.com" + $data.permalink
            $createdUtc = $data.created_utc
            $author = $data.author
            $combined = "$title $selftext"

            # Skip posts older than 48 hours
            $postAge = (Get-Date) - [DateTimeOffset]::FromUnixTimeSeconds($createdUtc).DateTime
            if ($postAge.TotalHours -gt 48) { continue }

            # Skip if already seen
            if ($seen.ContainsKey($postId)) { continue }

            # Must match construction keywords
            if ($combined -notmatch $keywordPattern) { continue }

            # For non-Chicago subs, must mention Chicago area
            if ($sub.requireLocation -and ($combined -notmatch $locationPattern)) { continue }

            # Skip contractor self-promotion
            if ($combined -match $negativePattern) { continue }

            # Skip link-only posts (usually spam)
            if ($data.is_self -eq $false -and $selftext.Length -lt 10) { continue }

            $seen[$postId] = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

            $snippet = $selftext
            if ($snippet.Length -gt 200) { $snippet = $snippet.Substring(0, 200) + "..." }

            $newPosts += [PSCustomObject]@{
                id      = $postId
                title   = $title
                url     = $permalink
                date    = (Get-Date).ToString("yyyy-MM-dd")
                source  = "Reddit - r/$subName"
                snippet = if ($snippet) { $snippet } else { $title }
                author  = $author
            }

            Write-Host "  NEW: $title" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "  Error scanning r/${subName}: $_" -ForegroundColor Red
    }

    # Rate limit - 2 seconds between subreddits
    Start-Sleep -Seconds 2
}

# Save seen IDs
$seen | ConvertTo-Json -Depth 5 | Set-Content $SeenFile -Encoding UTF8

# Output results
$result = [PSCustomObject]@{
    timestamp     = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    newPostsCount = $newPosts.Count
    posts         = $newPosts
}

$json = $result | ConvertTo-Json -Depth 5
$json | Set-Content $OutputFile -Encoding UTF8

Write-Host "`nDone. $($newPosts.Count) new matching posts found." -ForegroundColor Cyan

# Auto-integrate leads into Mission Control dashboard
if ($newPosts.Count -gt 0) {
    $pythonExe = "C:\Users\trisd\AppData\Local\Programs\Python\Python312\python.exe"
    $integrator = "C:\Users\trisd\clawd\scripts\integrate-scanner-leads.py"
    if (Test-Path $integrator) {
        Write-Host "Integrating leads into Mission Control..." -ForegroundColor Yellow
        & $pythonExe $integrator --source reddit
    }
}
