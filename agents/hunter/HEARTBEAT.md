# Hunter Heartbeat Tasks

Run these every cycle:

## 1. Craigslist Scan (4x/day: 8am, 12pm, 4pm, 8pm)
```powershell
cd C:\Users\trisd\clawd
powershell -ExecutionPolicy Bypass -File scripts\craigslist-monitor.ps1
```
- Finds new posts, auto-integrates to agent queue for Karl

## 2. Facebook Scan (2x/day: 9am, 3pm)
```powershell
cd C:\Users\trisd\clawd
python scripts\facebook-scan-advanced.py
python scripts\integrate-scanner-leads.py --source facebook
```

## 3. Reddit Scan (3x/day: 7am, 1pm, 7pm)
```powershell
cd C:\Users\trisd\clawd
python scripts\reddit-scan.py
python scripts\integrate-scanner-leads.py --source reddit
```

## 4. Nextdoor Scan (2x/day: 8:30am, 3:30pm)
```powershell
cd C:\Users\trisd\clawd
python scripts\nextdoor-scan.py
python scripts\integrate-scanner-leads.py --source nextdoor
```

## 5. Daily Outreach Package (7am daily)
- Read `data\outreach-log.json` for contact history
- Find PM targets due for follow-up (3/7/14 day intervals)
- Send Tris daily outreach summary via Telegram

## 6. Follow-Up Check (2pm daily)
- Read `data\outreach-log.json`
- Flag any contacts where follow-up is overdue
- Alert Tris if critical follow-ups are pending
