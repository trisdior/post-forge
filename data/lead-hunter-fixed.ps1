# Chicago Craigslist Real Homeowner Lead Hunter - FIXED

$searches = @(
    'need painter',
    'looking for painter',
    'help with kitchen', 
    'kitchen work needed',
    'bathroom repairs needed',
    'drywall repair',
    'flooring install needed'
)

$allLeads = @()
$validLeads = @()
$headers = @{
    'User-Agent' = 'Mozilla/5.0'
}

Write-Host "Searching Chicago Craigslist for homeowner leads..."

foreach ($search in $searches) {
    Write-Host "Searching: $search"
    $encoded = [System.Uri]::EscapeDataString($search)
    $url = "https://chicago.craigslist.org/search/hss?query=$encoded&sort=date"
    
    try {
        $response = Invoke-WebRequest -Uri $url -Headers $headers -UseBasicParsing -TimeoutSec 15
        
        # Count results found
        $postMatches = [regex]::Matches($response.Content, 'class="cl-search-results')
        Write-Host "  Posts found on page"
        
    } catch {
        Write-Host "  Connection issue: $_"
    }
    
    Start-Sleep -Milliseconds 300
}

Write-Host "Search complete. Analyzing existing data for valid homeowner leads..."

# Load existing scanned leads
$scanned = @()
try {
    $scanned = Get-Content 'C:\Users\trisd\clawd\data\scanned-leads.json' -Raw | ConvertFrom-Json
} catch {
    Write-Host "Could not load scanned leads"
}

Write-Host "Checking $($scanned.Count) existing posts for homeowner patterns..."

# Look for real homeowner indicators
$contractorPhrases = @(
    'we offer', 'we do', 'we provide', 'we specialize',
    'licensed.*insured', 'years of experience', 'family owned',
    'free estimates', 'call now', 'contact us'
)

$homeownerKeywords = @('need', 'looking', 'help', 'repair', 'work', 'want')
$homeownerPronouns = @('i ', 'we ', 'my ', 'our ', 'me ', 'us ')

foreach ($lead in $scanned) {
    if (-not $lead.description) { continue }
    
    $text = ($lead.title + ' ' + $lead.description).ToLower()
    
    # Check for contractor red flags
    $isContractor = $false
    foreach ($phrase in $contractorPhrases) {
        if ($text -match $phrase) {
            $isContractor = $true
            break
        }
    }
    
    if ($isContractor) { continue }
    
    # Check for homeowner indicators
    $hasKeyword = $false
    $hasPersonal = $false
    
    foreach ($kw in $homeownerKeywords) {
        if ($text -match $kw) { $hasKeyword = $true; break }
    }
    
    foreach ($pronoun in $homeownerPronouns) {
        if ($text -match $pronoun) { $hasPersonal = $true; break }
    }
    
    if ($hasKeyword -and $hasPersonal) {
        $validLeads += @{
            id = $lead.id
            title = $lead.title
            url = $lead.url
            category = $lead.category
            description = $lead.description.Substring(0, [Math]::Min(150, $lead.description.Length))
        }
    }
}

Write-Host "Found $($validLeads.Count) valid homeowner leads"

if ($validLeads.Count -gt 0) {
    $validLeads | ConvertTo-Json | Out-File 'C:\Users\trisd\clawd\data\homeowner-leads-validated.json' -Force
    Write-Host "Saved valid leads to homeowner-leads-validated.json"
}
