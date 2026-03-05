---
name: gc-estimating
description: Calculate construction estimates, material quantities, labor costs, and generate professional bid proposals for Valencia Construction. Use when asked to estimate, bid, price, quote, or calculate costs for any remodeling or construction project. Triggers on 'estimate', 'bid', 'quote', 'price out', 'how much would it cost', 'takeoff', or 'proposal'.
---

# Construction Estimating for Valencia Construction

## Overview

Generate accurate estimates for residential remodeling and commercial build-out projects in the Chicago market. All pricing should reflect Chicago-area rates.

## Estimating Process

1. **Gather project details** — Ask for scope, dimensions, materials preference, and any plans/photos
2. **Calculate quantities** — Square footage, linear footage, material counts
3. **Apply labor rates** — Based on trade and complexity
4. **Add materials** — Based on quality tier (budget, mid-range, high-end)
5. **Apply markup** — Overhead + profit
6. **Add contingency** — Typically 10-15% for remodels
7. **Generate proposal** — Professional document with scope, pricing, timeline

## Chicago Market Labor Rates (per hour, 2025-2026)

These are BASELINE rates. Adjust up for complexity, tight timelines, or specialty work.

| Trade | Budget | Mid-Range | High-End |
|-------|--------|-----------|----------|
| General Labor / Demo | $35-45 | $45-55 | $55-65 |
| Carpentry / Framing | $45-55 | $55-70 | $70-90 |
| Electrical | $65-80 | $80-100 | $100-130 |
| Plumbing | $65-85 | $85-110 | $110-140 |
| HVAC | $70-90 | $90-115 | $115-145 |
| Tile Setting | $50-65 | $65-85 | $85-120 |
| Painting | $35-45 | $45-60 | $60-80 |
| Drywall | $45-55 | $55-70 | $70-90 |
| Flooring Install | $40-55 | $55-75 | $75-100 |

## Estimating Rules

### Always Include
- Permits and inspection fees (Chicago permit costs vary — flag for Tris to confirm)
- Dumpster / haul-off for demo work
- Material delivery charges
- Protection of existing finishes (floors, walls, fixtures)
- Final cleaning

### Markup Structure
- **Overhead**: 15-20% (covers insurance, vehicle, tools, office, phone, etc.)
- **Profit**: 10-15%
- **Combined typical markup**: 30-40% on cost

Example:
```
Material + Labor Cost:  $25,000
Overhead (18%):         $4,500
Profit (12%):           $3,540
Total to Client:        $33,040
```

### Contingency
- Bathroom remodel: 10-15% (hidden issues common behind walls)
- Kitchen remodel: 10% (more predictable if no wall moves)
- Basement finish: 15% (moisture, structural unknowns)
- Commercial build-out: 10%
- Structural work: 15-20%

### Pricing by Project Type (rough Chicago ranges, mid-range finishes)

| Project | Budget/SF | Mid-Range/SF | High-End/SF |
|---------|-----------|-------------|-------------|
| Kitchen Remodel | $150-200 | $200-350 | $350-600+ |
| Bathroom Remodel | $200-300 | $300-500 | $500-800+ |
| Basement Finish | $40-60 | $60-90 | $90-150+ |
| General Remodel | $80-120 | $120-200 | $200-400+ |

These are total project costs per square foot including materials, labor, overhead, and profit.

## Quantity Calculations

### Common Formulas

```
Drywall sheets needed = (wall area SF ÷ 32) × 1.10  (10% waste)
Paint gallons = wall area SF ÷ 350 (per coat)
Tile SF = floor/wall area SF × 1.15 (15% waste for cuts)
Baseboard LF = room perimeter - door openings
Electrical outlets = 1 per 12 LF of wall (code minimum)
Insulation batts = wall area SF ÷ batt coverage SF
```

### Room Measurement Shortcuts

```
Wall area = perimeter × ceiling height
Perimeter = 2 × (length + width)
Floor area = length × width
Ceiling area = floor area (for flat ceilings)
```

## Payment Schedule Template

| Milestone | % of Total |
|-----------|-----------|
| Deposit (contract signing) | 25-33% |
| After demo & rough-in | 25-30% |
| After drywall & major installs | 20-25% |
| Final completion & punch list | 15-20% |

## Timeline Estimates

| Project | Typical Duration |
|---------|-----------------|
| Small bathroom remodel | 2-3 weeks |
| Full bathroom remodel | 3-5 weeks |
| Kitchen remodel (no wall changes) | 4-6 weeks |
| Kitchen remodel (layout change) | 6-10 weeks |
| Basement finish (800-1200 SF) | 6-10 weeks |
| Whole-home remodel | 3-6 months |

Add 2-4 weeks for Chicago permit approval times.

## Data-Driven Pricing

### Chicago Pricing Guide
Reference `C:\Users\trisd\clawd\data\chicago-pricing-guide.md` for detailed 2026 Chicago market rates across all project types, including per-SF rates, task-by-task handyman pricing, and Chicago-specific costs (permits, dumpsters, parking).

### Completed Jobs History
Check `C:\Users\trisd\clawd\data\completed-jobs.json` for Valencia's actual job data. When this has entries, prefer Tris's real margins and costs over market averages.

### Logging Completed Jobs
After a job is finished, log it:
```
python C:\Users\trisd\clawd\scripts\log-completed-job.py --type "Painting" --scope "2BR interior" --quoted 2400 --materials 320 --hours 18
```
This recalculates per-type averages automatically.

## Important Notes

- **Always present estimates as ranges** unless Tris has confirmed exact pricing
- **Flag any scope that's unclear** — ask for clarification before estimating
- **Never guarantee a price** without Tris reviewing and approving
- **Always note exclusions** — what's NOT included (appliances, furniture, landscaping, etc.)
- **Include permit disclaimer** — "Permit fees subject to City of Chicago requirements"
- **Material prices fluctuate** — note that estimates are valid for 30 days
- **Check completed jobs first** — if Tris has done similar work before, use actual data over market estimates
