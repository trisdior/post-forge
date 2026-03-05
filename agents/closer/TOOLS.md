# TOOLS.md - Local Notes

## Browser
- Browser: **Brave** (not Chrome)
- OpenClaw Browser Relay extension installed in Brave
- Facebook account: Chris Valencia
- Browser profile (persistent session): `C:\Users\trisd\clawd\data\facebook-browser-profile\`
- Shared with Hunter's Facebook scanner — same login session

## Posting Script
- `C:\Users\trisd\clawd\scripts\facebook-engage.js` — Playwright-based comment & DM poster
- Uses the same Brave browser profile as the scanner
- Modes: `--post` (comments), `--dm` (direct messages), `--login` (session setup)
- Exit code 2 = Facebook session expired, needs re-login

## Rate Limits
- Max 10 comments per run
- Max 5 DMs per run
- 30-60s random delay between comments
- 60-90s random delay between DMs
- Human-like typing speed (50-100ms per character)
