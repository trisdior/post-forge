# Facebook Group Lead Scanner for Valencia Construction
# Searches Chicago-area Facebook groups for people looking for contractors
# Uses Google search (site:facebook.com) as a proxy since FB has no public API

$ErrorActionPreference = "Stop"
$outputFile = "C:\Users\trisd\clawd\data\facebook-leads-latest.json"
$seenFile = "C:\Users\trisd\clawd\data\facebook-seen.json"

# Load seen posts
$seen = @{}
if (Test-Path $seenFile) {
    $seenData = Get-Content $seenFile -Raw | ConvertFrom-Json
    foreach ($prop in $seenData.PSObject.Properties) {
        $seen[$prop.Name] = $true
    }
}

# Search queries targeting Facebook groups where people ask for contractors
$queries = @(
    'site:facebook.com/groups "chicago" "contractor" "looking for" -hiring',
    'site:facebook.com/groups "chicago" "remodel" "recommend" -ad',
    'site:facebook.com/groups "chicago" "handyman" "need" -hiring',
    'site:facebook.com/groups "chicago" "renovation" "looking for" -ad',
    'site:facebook.com/groups "chicago" "kitchen" "contractor" "recommend"',
    'site:facebook.com/groups "chicago" "bathroom" "remodel" "looking"',
    'site:facebook.com/groups "chicago" "demolition" "need"',
    'site:facebook.com/groups "chicago" "property manager" "contractor"'
)

$allResults = @()

foreach ($query in $queries) {
    try {
        $encoded = [System.Uri]::EscapeDataString($query)
        $url = "https://www.google.com/search?q=$encoded&tbs=qdr:d&num=10"
        
        $headers = @{
            "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        $response = Invoke-WebRequest -Uri $url -Headers $headers -UseBasicParsing -TimeoutSec 15
        $html = $response.Content
        
        # Extract results
        $matches = [regex]::Matches($html, '<a[^>]*href="(https?://(?:www\.)?facebook\.com/groups/[^"]*)"[^>]*>.*?</a>', 'Singleline')
        
        foreach ($match in $matches) {
            $link = $match.Groups[1].Value
            # Clean tracking params
            $link = $link -replace '&sa=.*$', ''
            $link = $link -replace '\?sa=.*$', ''
            
            if (-not $seen.ContainsKey($link)) {
                # Try to extract title/snippet
                $snippet = ""
                $titleMatch = [regex]::Match($match.Value, '>([^<]+)<')
                if ($titleMatch.Success) {
                    $snippet = $titleMatch.Groups[1].Value
                }
                
                $allResults += @{
                    url = $link
                    snippet = $snippet
                    query = $query
                    found = (Get-Date -Format "yyyy-MM-dd HH:mm")
                }
                $seen[$link] = $true
            }
        }
        
        # Rate limit
        Start-Sleep -Seconds 3
    } catch {
        Write-Host "Query failed: $query - $($_.Exception.Message)"
    }
}

# Save results
$allResults | ConvertTo-Json -Depth 3 | Set-Content $outputFile -Encoding UTF8

# Save seen
$seen | ConvertTo-Json | Set-Content $seenFile -Encoding UTF8

# Output summary
Write-Host "Found $($allResults.Count) new Facebook group leads"
Write-Host "Output: $outputFile"

# Auto-integrate leads into Mission Control dashboard
if ($allResults.Count -gt 0) {
    $pythonExe = "C:\Users\trisd\AppData\Local\Programs\Python\Python312\python.exe"
    $integrator = "C:\Users\trisd\clawd\scripts\integrate-scanner-leads.py"
    if (Test-Path $integrator) {
        Write-Host "Integrating leads into Mission Control..." -ForegroundColor Yellow
        & $pythonExe $integrator --source facebook
    }
}
