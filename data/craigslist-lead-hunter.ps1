# Chicago Craigslist Real Homeowner Lead Hunter
# Search for actual people asking for help (not contractor ads)

$searches = @(
    'need painter',
    'looking for painter',
    'help with kitchen', 
    'kitchen work needed',
    'bathroom repairs needed',
    'bathroom work',
    'drywall repair',
    'wall damage',
    'flooring install needed'
)

$allLeads = @()
$headers = @{
    'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

Write-Host "🔍 Searching Chicago Craigslist for real homeowner leads..."
Write-Host "==========================================================="

foreach ($search in $searches) {
    $encoded = [System.Uri]::EscapeDataString($search)
    $url = "https://chicago.craigslist.org/search/hss?query=$encoded&sort=date"
    
    Write-Host "`nSearching: '$search'..."
    try {
        $response = Invoke-WebRequest -Uri $url -Headers $headers -UseBasicParsing -TimeoutSec 15
        
        # Parse HTML for post listings
        $lines = $response.Content -split "`n"
        foreach ($line in $lines) {
            # Look for post result lines
            if ($line -match '<a href="(/chc/[^"]+d/[^"]+)"' -and $line -match '>([^<]+)</a>') {
                $matches = [regex]::Match($line, '<a href="(/chc/[^"]+)"[^>]*>([^<]+)</a>')
                if ($matches.Success) {
                    $postUrl = 'https://chicago.craigslist.org' + $matches.Groups[1].Value
                    $title = $matches.Groups[2].Value.Trim()
                    
                    $allLeads += @{
                        title = $title
                        url = $postUrl
                        search_term = $search
                        found_at = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
                    }
                    Write-Host "  ✓ $title"
                }
            }
        }
        
        Write-Host "  Found $(($lines | Select-String -Pattern 'class="cl-search-results"' | Measure-Object).Count) results"
    } catch {
        Write-Host "  ✗ Error: $_"
    }
    
    Start-Sleep -Milliseconds 500  # Be respectful to Craigslist
}

Write-Host "`n========================================================="
Write-Host "Total posts found: $($allLeads.Count)"

if ($allLeads.Count -gt 0) {
    $allLeads | ConvertTo-Json | Out-File 'C:\Users\trisd\clawd\data\fresh-craigslist-posts.json' -Force
    Write-Host "Results saved to fresh-craigslist-posts.json"
} else {
    Write-Host "No posts found. Craigslist may be blocking automated requests."
}
