$d = Get-Content 'C:\Users\trisd\clawd\data\craigslist-latest.json' -Raw | ConvertFrom-Json
$best = @()

# Labor gigs = people looking for workers (best leads)
foreach ($p in $d.posts) {
    if ($p.source -match 'lbg|dmg') {
        $best += $p
    }
}

# If not enough from gigs, also grab household services that look like someone seeking help
Write-Output "=== LABOR/DOMESTIC GIGS (People looking for help) ==="
$best | Select-Object -First 10 | ForEach-Object {
    Write-Output "$($_.title)"
    Write-Output "$($_.url)"
    Write-Output "---"
}

Write-Output ""
Write-Output "=== HOUSEHOLD SERVICES (Mostly other contractors) ==="
$hss = @()
foreach ($p in $d.posts) {
    if ($p.source -match 'hss') {
        $hss += $p
    }
}
$hss | Select-Object -First 5 | ForEach-Object {
    Write-Output "$($_.title)"
    Write-Output "$($_.url)"
    Write-Output "---"
}

Write-Output ""
Write-Output "Total posts: $($d.posts.Count) | Gigs: $($best.Count) | HSS: $($hss.Count)"
