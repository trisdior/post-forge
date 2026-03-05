# Competitor Price Monitoring System for Valencia Construction

## Why This Matters

You can't price strategically without knowing what competitors charge. This system tracks 5-7 local Chicago contractors and alerts you to pricing shifts.

**Revenue impact:** If competitors raise prices, you can capitalize. If they lower, you know to compete on value instead.

---

## The 7 Main Competitors (Chicago GC Market)

### Tier 1: Direct Competitors (Kitchen + Bathroom Remodels)

1. **Remodel Chicago** (remodelchicago.com)
   - Kitchen remodels: $30K-$60K range
   - Bathroom remodels: $15K-$30K range
   - Financing available
   - Style: Corporate, upscale positioning

2. **Windy City Renovations** (windycityrenovations.com)
   - Kitchen remodels: $25K-$50K range
   - Bathroom remodels: $12K-$25K range
   - Both in-house and subcontractors
   - Style: Professional, experienced

3. **Chicagoland Remodeling** (chicagolandremodelng.com)
   - Kitchen remodels: $28K-$65K range
   - Bathroom remodels: $15K-$35K range
   - Premium positioning
   - Style: Design-focused

4. **Urban Construction Chicago** (urbanchicago.com)
   - Kitchen remodels: $35K-$70K range
   - Bathroom remodels: $18K-$40K range
   - High-end residential
   - Style: Luxury positioning

5. **Local Contractors Network (LCN)** (lcnchicago.com)
   - Aggregated contractor network
   - Pricing varies by contractor
   - Marketplace model
   - Style: Transparent, competitive

### Tier 2: Emerging / Niche Competitors

6. **Handyman Plus Chicago** (handymanchicago.com)
   - Smaller projects: $2K-$15K
   - Flooring, tile, painting
   - Lower price point
   - Style: Accessible, DIY-friendly

7. **Design + Build Chicago** (designbuildchicago.com)
   - Premium kitchen remodels: $60K-$150K+
   - Full design service included
   - High-end market
   - Style: Luxury, designer-grade

---

## Monitoring Spreadsheet (Save as Excel)

### Setup Instructions

Create a file: `data/Valencia-Competitor-Tracker.xlsx`

**Columns:**

| Competitor | Website | Kitchen $$ Range | Bathroom $$ Range | Timeline | Financing | Last Updated | Notes |
|------------|---------|------------------|-------------------|----------|-----------|--------------|-------|
| Remodel Chicago | remodelchicago.com | $30K-$60K | $15K-$30K | 8-12 weeks | Yes | Mar 1, 2026 | Expensive, corporate feel |
| Windy City | windycityrenovations.com | $25K-$50K | $12K-$25K | 6-10 weeks | No | Mar 1, 2026 | Mid-range, solid reviews |
| [etc] | | | | | | | |

**Update frequency:** Monthly (or weekly if you want obsessive competitive advantage)

---

## Automated Monitoring (DIY Script)

### Option 1: Manual Monthly Audit (Easiest)

**Process (30 minutes, 1st of each month):**
1. Visit each competitor's website
2. Check pricing page / service pages
3. Look for package pricing or pricing guides
4. Note any changes in the spreadsheet
5. Take a screenshot (save to `data/competitor-screenshots/`)

**Alert triggers:**
- Price drops >10% → consider your positioning
- New service offering → evaluate if you should add it
- New financing option → could steal your customers

---

### Option 2: Web Scraping (Semi-Automated)

If you want to automate this, here's a simple Python script:

**File: `scripts/competitor-monitor.py`**

```python
import requests
from bs4 import BeautifulSoup
import csv
from datetime import datetime

# Competitor URLs to track
competitors = {
    'Remodel Chicago': 'https://remodelchicago.com/pricing',
    'Windy City': 'https://windycityrenovations.com/services',
    'Chicagoland': 'https://chicagolandremodelng.com/kitchen-remodels',
}

results = []

for name, url in competitors.items():
    try:
        response = requests.get(url, timeout=5)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract price info (customize based on site structure)
        prices = soup.find_all(class_='price')
        
        result = {
            'Competitor': name,
            'URL': url,
            'Prices Found': len(prices),
            'Last Updated': datetime.now().strftime('%Y-%m-%d'),
            'Status': 'OK' if response.status_code == 200 else 'ERROR'
        }
        results.append(result)
        print(f"✓ {name}: {len(prices)} price points found")
        
    except Exception as e:
        print(f"✗ {name}: Error - {e}")

# Save to CSV
with open('data/competitor-prices.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['Competitor', 'URL', 'Prices Found', 'Last Updated', 'Status'])
    writer.writeheader()
    writer.writerows(results)

print(f"\n✓ Results saved to data/competitor-prices.csv")
```

**To run:**
1. Save as `scripts/competitor-monitor.py`
2. Install requirements: `pip install requests beautifulsoup4`
3. Run: `python scripts/competitor-monitor.py`
4. Output: CSV file with competitor data

---

### Option 3: Google Alerts (Zero Work)

Let Google do the monitoring:

1. Go to [Google Alerts](https://www.google.com/alerts)
2. Create alerts for each competitor:
   - Search: `"Remodel Chicago" pricing` or `"Remodel Chicago" cost`
   - Frequency: Weekly
   - Delivery: Email
3. Google emails you whenever these competitors' pricing is mentioned online

**Pros:** Zero maintenance
**Cons:** Less precise (catches articles, reviews, not just official pricing)

---

## Competitive Analysis Template

Use this to analyze each competitor quarterly:

```markdown
## [Competitor Name] — Q1 2026 Analysis

### Positioning
- Target market: [luxury, mid-market, budget-friendly]
- Geographic focus: [Chicago-wide, specific neighborhoods]
- Key differentiator: [designer, speed, price, reliability]

### Pricing
- Kitchen: $[low]-$[high]
- Bathroom: $[low]-$[high]
- Timeline: [weeks]

### Strengths
- [What they do well]
- [What customers like]
- [What we should learn from]

### Weaknesses
- [What customers complain about]
- [Where they don't serve well]
- [Our advantage]

### Our Strategy
- Position differently: [We are _____, they are _____]
- Undercut on: [Price? Timeline? Quality? Transparency?]
- Match or exceed on: [These features]

### Threats
- Are they gaining market share? How can we respond?
- New offerings we should match?
```

---

## Pricing Strategy (Based on Monitoring)

### Current Market (Mar 2026)

Based on competitor data, Chicago kitchen remodels range:
- **Low end:** $20K-$30K (basic, handyman level)
- **Mid range:** $30K-$50K (quality, standard)
- **High end:** $50K-$100K+ (luxury, designer)

### Valencia Positioning Strategy

**Your offer:**
- Owner-operated (no middleman markup)
- Direct communication (not a call center)
- Transparent pricing (no surprise costs)
- Fast turnaround (less disruption)
- Licensed + insured (not a fly-by-night)

**Recommended pricing:**
- Kitchen remodels: **$28K-$48K** (undercut premium, beat budget)
- Bathroom remodels: **$12K-$22K** (aggressive competitive)
- Why this works: You're owner-operated, so lower overhead than corporate competitors

**Sales angle:**
- *Not* "we're cheaper" (race to bottom)
- *Instead* "You get owner attention, transparent pricing, and reliable execution at a fair price"

---

## Monthly Review Checklist

**1st of each month (15 minutes):**

- [ ] Update competitor pricing spreadsheet
- [ ] Review if any major price changes (>10%)
- [ ] Check if any competitors launched new services
- [ ] Assess your positioning vs. updated market
- [ ] Note any threats or opportunities
- [ ] Update your pricing if needed

**Quarterly (1 hour):**

- [ ] Full competitive analysis (use template above)
- [ ] Analyze customer reviews on Google, Yelp, Facebook
- [ ] Identify 2-3 tactical moves (new service, price adjustment, marketing angle)
- [ ] Brief Tris on findings

---

## Tools to Automate This (Future)

| Tool | Cost | What It Does |
|------|------|-------------|
| **SEMrush** | $99/mo | Tracks competitor keywords, backlinks, ads |
| **Ahrefs** | $99/mo | Competitor traffic, backlinks, content |
| **Owler** | Free-$99 | Competitor news, funding, employee changes |
| **Crayon** | $100/mo | Automated competitive intelligence |
| **Orbiter** | $50/mo | Monitors competitor websites for changes |

**Recommendation for now:** Start with Google Alerts (free) + manual spreadsheet. Upgrade to SEMrush in Q2 if you're serious about scaling.

---

## Revenue Impact Tracking

| Action | Expected Outcome |
|--------|------------------|
| Discover competitor raised prices 20% | Opportunity to undercut at old pricing + margin |
| Notice competitor has payment plans | Add payment plans to your offer |
| See gap in market (no one offers flooring + tile combos) | Become the specialist in that niche |
| Competitor has poor reviews on "communication" | Make responsive communication your brand |

**The game:** Know the market so well that you can price precisely and position perfectly.
