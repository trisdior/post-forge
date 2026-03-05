$apiKey = 'BSAiCfCd972hBSaOFtD3URXDybJrHZu'
$baseUrl = 'https://api.search.brave.com/res/v1/web/search'

# Array of search queries
$queries = @(
    'site:facebook.com "looking for contractor" Chicago bathroom OR kitchen',
    'site:facebook.com "need painter" Chicago',
    'site:facebook.com "looking for" handyman Chicago',
    'site:facebook.com "recommendations" contractor Chicago "drywall" OR "painting" OR "flooring"',
    'site:facebook.com "does anyone know" contractor Chicago',
    'site:facebook.com "seeking" general contractor Chicago',
    'site:facebook.com "help with" remodel Chicago urgent OR ASAP'
)

$allResults = @()
$queryCount = 0
$postsFound = 0

foreach ($query in $queries) {
    $queryCount++
    Write-Host "Running query $queryCount/7" -ForegroundColor Cyan
    
    try {
        $uri = $baseUrl + '?q=' + [System.Net.WebUtility]::UrlEncode($query)
        $headers = @{
            'Accept' = 'application/json'
            'X-Subscription-Token' = $apiKey
        }
        
        $response = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.web) {
            $webCount = ($response.web | Measure-Object | Select-Object -ExpandProperty Count)
            $postsFound += $webCount
            Write-Host "  Found $webCount results" -ForegroundColor Green
            $allResults += @{
                query = $query
                results = $response.web
                count = $webCount
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

Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Yellow
Write-Host "Queries run: $queryCount" -ForegroundColor Yellow
Write-Host "Posts found: $postsFound" -ForegroundColor Yellow

$allResults | ConvertTo-Json -Depth 5 | Out-File -FilePath 'brave-search-results.json' -Force
Write-Host "Raw results saved to brave-search-results.json"
