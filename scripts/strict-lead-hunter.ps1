# Strict Lead Hunter for Valencia Construction - Chicago
# Validates leads HEAVILY against homeowner vs contractor criteria
# Only adds REAL homeowner leads asking for help

param(
    [string]$SeenFile = "C:\Users\trisd\clawd\data\craigslist-seen.json",
    [string]$ReportFile = "C:\Users\trisd\clawd\data\lead-hunt-report.json"
)

$ErrorActionPreference = "Stop"

# STRICT search terms that target homeowners asking for help
$searchTerms = @(
    "need painter",
    "looking for painter",
    "help with kitchen",
    "kitchen work needed",
    "bathroom repairs needed",
    "bathroom work",
    "drywall repair",
    "wall damage needs fixing",
    "flooring install needed"
)

# RED FLAGS - skip these
$redFlags = @(
    "we offer",
    "we specialize",
    "we do",
    "licensed and insured",
    "years of experience",
    "family owned",
    "call us",
    "contact us",
    "company name",
    "w2",
    "1099",
    "hiring",
    "employment",
    "job posting"
)

# Homeowner indicators (pronouns and context)
$homeownerIndicators = @(
    '\b(I|we|my|our|our home|our house|my house|my place)\b',
    '(need help|need someone|looking for|seeking|urgent)',
    '(damage|repair|fix|broken|leak|cracked)'
)

$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    "Accept" = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    "Accept-Language" = "en-US,en;q=0.5"
}

# Search Craigslist for each term
function Search-Craigslist {
    param([string]$term)
    $encoded = [uri]::EscapeDataString($term)
    $url = "https://chicago.craigslist.org/search/hsh?query=$encoded"
    
    Write-Host "Searching: '$term'" -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri $url -Headers $headers -UseBasicParsing -TimeoutSec 30
        $html = $response.Content
        
        # Extract listing links and titles
        $matches_ = [regex]::Matches($html, '<a href="(https://chicago\.craigslist\.org/[^"]*?/(\d+)\.html)"[^>]*>([^<]+)</a>')
        
        Write-Host "  Found $($matches_.Count) results" -ForegroundColor Gray
        
        $results = @()
        foreach ($m in $matches_) {
            $results += @{
                postUrl = $m.Groups[1].Value
                postId = $m.Groups[2].Value
                title = $m.Groups[3].Value.Trim()
            }
        }
        
        return $results
    }
    catch {
        Write-Host "  Error: $_" -ForegroundColor Red
        return @()
    }
}

# Fetch and validate full post content
function Validate-Post {
    param(
        [string]$postUrl,
        [string]$postId,
        [string]$title
    )
    
    try {
        $response = Invoke-WebRequest -Uri $postUrl -Headers $headers -UseBasicParsing -TimeoutSec 30
        $html = $response.Content
        
        # Extract post body
        $bodyMatch = [regex]::Match($html, '<section id="postingbody"[^>]*>(.+?)</section>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
        $postBody = if ($bodyMatch.Success) { $bodyMatch.Groups[1].Value } else { $title }
        
        # Clean HTML
        $postText = $postBody -replace '<[^>]+>', ' '
        $postText = $postText -replace '\s+', ' '
        $postText = $postText -replace '&quot;', '"'
        $postText = $postText -replace '&amp;', '&'
        $postText = $postText.Trim()
        
        $validation = @{
            isValid = $true
            score = 0
            reason = ""
            indicators = @()
            redFlags = @()
        }
        
        # Check for RED FLAGS
        foreach ($flag in $redFlags) {
            if ($postText -imatch $flag) {
                $validation.isValid = $false
                $validation.redFlags += $flag
            }
        }
        
        # Check for HOMEOWNER INDICATORS
        $indicatorCount = 0
        foreach ($pattern in $homeownerIndicators) {
            if ($postText -imatch $pattern) {
                $validation.indicators += $pattern
                $indicatorCount++
                $validation.score += 30
            }
        }
        
        # If no red flags but has indicators, it's likely valid
        if ($validation.isValid) {
            if ($indicatorCount -lt 2) {
                $validation.isValid = $false
                $validation.reason = "Not enough homeowner signals (only $indicatorCount found)"
            } else {
                $validation.reason = "Valid homeowner lead"
            }
        } else {
            $validation.reason = "Red flags detected: $($validation.redFlags -join ', ')"
        }
        
        return @{
            postId = $postId
            title = $title
            url = $postUrl
            textSnippet = $postText.Substring(0, [Math]::Min(300, $postText.Length))
            validation = $validation
            valid = $validation.isValid
        }
    }
    catch {
        Write-Host "    Error fetching post: $_" -ForegroundColor Yellow
        return $null
    }
}

# Load seen posts
$seen = @{}
if (Test-Path $SeenFile) {
    try {
        $seenData = Get-Content $SeenFile -Raw | ConvertFrom-Json
        foreach ($prop in $seenData.PSObject.Properties) {
            $seen[$prop.Name] = $prop.Value
        }
    } catch { }
}

$validLeads = @()
$rejectedLeads = @()
$totalChecked = 0

# Search with each term
foreach ($term in $searchTerms) {
    $results = Search-Craigslist -Term $term
    
    foreach ($result in $results) {
        # Skip if already seen
        if ($seen.ContainsKey($result.postId)) {
            continue
        }
        
        $totalChecked++
        $validation = Validate-Post -postUrl $result.postUrl -postId $result.postId -title $result.title
        
        if ($validation -and $validation.valid) {
            Write-Host "  ✓ VALID: $($result.title)" -ForegroundColor Green
            $validLeads += $validation
            $seen[$result.postId] = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        } else {
            Write-Host "  ✗ REJECTED: $($result.title)" -ForegroundColor DarkGray
            if ($validation) {
                Write-Host "    Reason: $($validation.validation.reason)" -ForegroundColor DarkGray
                $rejectedLeads += $validation
            }
        }
        
        Start-Sleep -Milliseconds 500
    }
    
    Start-Sleep -Seconds 2
}

# Save seen posts
$seen | ConvertTo-Json -Depth 5 | Set-Content $SeenFile -Encoding UTF8

# Generate report
$report = @{
    timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    summary = @{
        totalSearched = $totalChecked
        validLeadsFound = $validLeads.Count
        rejectedLeads = $rejectedLeads.Count
        qualityScore = if ($totalChecked -gt 0) { [Math]::Round(($validLeads.Count / $totalChecked) * 100, 1) } else { 0 }
    }
    validLeads = $validLeads
    rejectedLeads = $rejectedLeads | Select-Object -First 10  # Top 10 rejections for audit
}

$report | ConvertTo-Json -Depth 5 | Set-Content $ReportFile -Encoding UTF8

# Display summary
Write-Host "`n=== LEAD HUNT SUMMARY ===" -ForegroundColor Yellow
Write-Host "Total Posts Checked: $($report.summary.totalSearched)" -ForegroundColor Cyan
Write-Host "Valid Homeowner Leads Found: $($report.summary.validLeadsFound)" -ForegroundColor Green
Write-Host "Rejected Posts: $($report.summary.rejectedLeads)" -ForegroundColor DarkGray
Write-Host "Quality Score: $($report.summary.qualityScore)%" -ForegroundColor Magenta

if ($validLeads.Count -gt 0) {
    Write-Host "`n=== VALID LEADS ===" -ForegroundColor Green
    foreach ($lead in $validLeads) {
        Write-Host "  • $($lead.title)" -ForegroundColor White
        Write-Host "    URL: $($lead.url)" -ForegroundColor Gray
        Write-Host "    Indicators: $(($lead.validation.indicators | Measure-Object).Count) matched" -ForegroundColor Gray
    }
}

Write-Output $report | ConvertTo-Json -Depth 5
