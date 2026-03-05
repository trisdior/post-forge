---
name: lead-hunter
description: Find and qualify leads for any local business by scanning Craigslist, Reddit, Facebook, Nextdoor, and Google. Scores leads by intent, generates outreach templates, and tracks follow-ups. Use when asked to find leads, generate prospects, hunt for clients, do outreach, or build a sales pipeline for any service business.
---

# Lead Hunter

Autonomous lead generation for local service businesses.

## Usage

When triggered, collect:
1. **Business type** — what services you offer
2. **Location** — city/metro area to target
3. **Platforms to scan** — Craigslist, Reddit, Facebook, Nextdoor, Google (default: all)
4. **Budget** — free (organic only) or paid (ads)

## Lead Scoring

Score each lead 0-100 based on:

| Signal | Points |
|--------|--------|
| Explicitly asking for service | +30 |
| Located in target area | +20 |
| Urgent language ("ASAP", "this week") | +15 |
| Budget mentioned | +10 |
| Contact info provided | +10 |
| Recent post (<48h) | +10 |
| Multiple responses already | -5 |

**Hot lead**: 60+ (reach out immediately)
**Warm lead**: 30-59 (add to outreach queue)
**Cold lead**: <30 (skip or nurture)

## Platform Scanning

### Craigslist
- Search: services wanted, gigs, housing (renovation)
- Filter by location and date
- Look for: "looking for contractor", "need help with", "ISO"

### Reddit
- Subreddits: r/HomeImprovement, r/[city], r/Contractor, r/RealEstate
- Look for: questions about projects, complaints about contractors, advice threads

### Facebook
- Local groups: "[City] Home Improvement", "Contractor Reviews [City]"
- Marketplace: home services category
- Look for: recommendation requests, project posts

### Nextdoor
- Neighborhood posts asking for contractor recommendations
- Service request posts

### Google
- "[service] needed [city]" forum results
- Recent Yelp/Google reviews mentioning competitor issues

## Outreach Templates

Generate platform-appropriate responses:
- **Craigslist**: Direct, professional, include credentials
- **Reddit**: Helpful first, business second. Add value before pitching.
- **Facebook**: Friendly, community-oriented, social proof
- **Nextdoor**: Neighbor-to-neighbor tone, local references

## Output Format

```
# Lead Report — [Date]

## Hot Leads (60+)
1. [Platform] | Score: [X] | [Title/Description]
   URL: [link]
   Outreach: [Ready-to-send message]

## Warm Leads (30-59)
[Same format]

## Summary
- Total scanned: [N]
- Hot leads: [N]
- Warm leads: [N]
- Recommended actions: [list]
```
