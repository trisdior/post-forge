# Mission Control Dashboard — Real-Time Data Enhancement

## Current State

Mission Control (localhost:3001) is live and showing:
- 3 business pillars (Valencia Construction, Trovva, Delvrai)
- Static progress trackers
- Revenue goals and checklists

## What's Missing (Real-Time Data)

To make this a **true operations dashboard**, we need:

1. **Lead pipeline** (prospects → estimates → signed)
2. **Daily call metrics** (calls made, callbacks, conversion rate)
3. **Social engagement** (post reach, engagement, traffic)
4. **Website analytics** (visitors, bounce rate, form fills)
5. **Sales velocity** (time to first client, conversion funnel)

---

## THE PLAN: Four Real-Time Data Streams

### Stream 1: Lead Tracker (Spreadsheet → Dashboard)

**Source:** `data/Valencia-Lead-Tracker.xlsx`

**What to display:**
- Total leads in pipeline
- Leads by stage (initial contact, interested, estimate sent, negotiating, signed)
- Conversion rate (leads → estimates → signed)
- Days in pipeline (how long prospects take to decide)

**Format for dashboard:**
```
VALENCIA LEAD PIPELINE
━━━━━━━━━━━━━━━━━━━━━━
Total Contacts: 28
├─ Initial Contact: 15
├─ Interested: 8
├─ Estimate Sent: 3
├─ Negotiating: 1
└─ Signed: 1 🎯

Conversion Rate: 3.6% (1/28)
Avg. Days to Close: 12 days
```

**How to automate:**
Option 1: Export Excel → paste into Mission Control JSON
Option 2: Sync Google Sheets → API → Dashboard
Option 3: Manual update 1x daily (5 minutes)

**Revenue impact:** See exactly where prospects are stuck. If 30% are in "estimate sent" with no response, that's your problem to solve.

---

### Stream 2: Daily Lead Gen Metrics

**Source:** Valencia Daily System (8 AM + 8 PM cron logs)

**What to display:**
- Calls made today
- Posts made today
- Lead responses
- New form submissions
- Conversion to consultations

**Format:**
```
TODAY'S ACTIVITY
━━━━━━━━━━━━━━━━━━━━━━
Calls Made: 3/3 ✓
Posts Made: 2/2 ✓
Form Submissions: 1
Lead Responses: 0
Consultations Booked: 0
```

**How to automate:**
1. Your cron jobs (8 AM blitz + 8 PM check-in) already log activity
2. Save logs to: `data/daily-activity.json`
3. Mission Control reads the latest entry and displays
4. Chart 7-day rolling average (Shows trends, not just today)

**Revenue impact:** Real-time accountability. You see daily progress toward 15 calls/day and 14 posts/week targets.

---

### Stream 3: Website Analytics (Google Analytics)

**Source:** Google Analytics 4 (installed today)

**What to display:**
- Today's visitors
- This week's form submissions
- Top traffic source
- Bounce rate

**Format:**
```
WEBSITE PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━
Today's Visitors: 24
This Week's Forms: 3
Top Source: Facebook (40%)
Mobile vs Desktop: 65% / 35%
```

**How to automate:**
1. GA4 has a public reporting API
2. Create a simple Node script that pulls today's metrics
3. Run it 1x daily (early morning)
4. Store in `data/ga4-metrics.json`
5. Dashboard reads and displays

**Revenue impact:** Confirms if your social posts are driving traffic. If traffic drops, investigate immediately.

---

### Stream 4: Sales Velocity Tracker

**Source:** Manual daily updates (but auto-calculated)

**What to track:**
- Days since first contact to estimate (avg)
- Days from estimate to signed (avg)
- Consultation-to-estimate conversion
- Total pipeline value (sum of all estimates)

**Format:**
```
SALES VELOCITY
━━━━━━━━━━━━━━━━━━━━━━
Avg Time to Estimate: 5 days
Avg Time to Close: 12 days
Pipeline Value: $127,400
Consultation → Estimate: 40%
Estimate → Signed: 20%
```

**Why this matters:** If conversion takes 30+ days, something's broken (follow-up? pricing? objections?). You'll see it immediately.

---

## IMPLEMENTATION ROADMAP

### Phase 1: Static Dashboard (This Week)
✓ Already have Mission Control running
- Add Valencia lead pipeline widget (manual entry for now)
- Add daily activity tracker (reads from cron logs)
- Add sales velocity calculator
- Clean up UI for clarity

### Phase 2: Semi-Automated (Week 2)
- Connect Google Analytics API
- Pull daily visitor counts and form fills
- Create simple data sync script
- Update dashboard 1x daily (automated)

### Phase 3: Fully Real-Time (Week 3+)
- Create webhook from lead form → auto-update pipeline
- Create webhook from GA4 → auto-update metrics
- Add charts/graphs (7-day trends)
- Mobile-friendly dashboard view

---

## Step-by-Step Implementation (Phase 1)

### Step 1: Update Lead Pipeline Widget

**Edit the Valencia section in Mission Control:**

```json
{
  "name": "Valencia Construction",
  "status": "LEAD GENERATION",
  "metrics": {
    "totalLeads": 28,
    "pipeline": {
      "initialContact": 15,
      "interested": 8,
      "estimateSent": 3,
      "negotiating": 1,
      "signed": 1
    },
    "conversionRate": "3.6%",
    "avgDaysToClose": 12
  },
  "lastUpdated": "2026-03-01"
}
```

**Display it like:**
```
VALENCIA LEAD PIPELINE
├─ Total: 28 prospects
├─ Conversion: 3.6% (1 signed)
├─ Avg Close Time: 12 days
└─ Status: Early stage, tracking growth
```

---

### Step 2: Add Daily Activity Widget

**Create a new section in Mission Control:**

```json
{
  "name": "Daily Lead Gen",
  "period": "2026-03-01",
  "metrics": {
    "callsMade": 3,
    "callsTarget": 3,
    "postsMade": 2,
    "postsTarget": 2,
    "formSubmissions": 1,
    "consultationsBooked": 0
  }
}
```

**Display:**
```
TODAY'S LEAD GEN
├─ Calls: 3/3 ✓
├─ Posts: 2/2 ✓
├─ Form Fills: 1
└─ Consultations: 0 (follow up needed)
```

**Update mechanism:**
- Your cron job (8 PM check-in) writes to `data/daily-activity.json`
- Mission Control reads it and displays
- Shows rolling 7-day average below

---

### Step 3: Add Sales Velocity Dashboard

**New widget for pipeline health:**

```json
{
  "name": "Sales Health",
  "metrics": {
    "avgDaysToEstimate": 5,
    "avgDaysToClose": 12,
    "pipelineValue": 127400,
    "consultationConversionRate": "40%",
    "estimateConversionRate": "20%"
  }
}
```

**Display:**
```
SALES VELOCITY
├─ Consultation → Estimate: 40% ✓
├─ Estimate → Signed: 20% (low - fix objections?)
├─ Avg Days to Close: 12 days
└─ Pipeline Value: $127,400
```

**Insight:** If estimate-to-signed is stuck at 20%, you need to improve follow-up, pricing, or deal structure.

---

### Step 4: Create Data Update Routine

**File: `scripts/mission-control-update.js`**

```javascript
const fs = require('fs');
const path = require('path');

// Read lead tracker
const leadData = JSON.parse(
  fs.readFileSync('data/Valencia-Lead-Tracker.xlsx', 'utf8')
);

// Read daily activity
const activityData = JSON.parse(
  fs.readFileSync('data/daily-activity.json', 'utf8')
);

// Calculate metrics
const metrics = {
  valencia: {
    totalLeads: leadData.length,
    signed: leadData.filter(l => l.status === 'signed').length,
    conversionRate: (leadData.filter(l => l.status === 'signed').length / leadData.length * 100).toFixed(1) + '%',
    pipelineValue: leadData.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
  },
  daily: {
    callsMade: activityData.callsMade,
    postsMade: activityData.postsMade,
    formSubmissions: activityData.formSubmissions,
  },
  lastUpdated: new Date().toISOString(),
};

// Write to Mission Control
fs.writeFileSync(
  'public/data/mission-control-metrics.json',
  JSON.stringify(metrics, null, 2)
);

console.log('✓ Mission Control updated');
```

**To run:** `node scripts/mission-control-update.js`

---

## Google Analytics Integration (Phase 2)

Once GA4 is installed, connect the API:

**File: `scripts/ga4-sync.js`**

```javascript
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const analyticsDataClient = new BetaAnalyticsDataClient();

async function getMetrics() {
  const response = await analyticsDataClient.runReport({
    property: `properties/YOUR_GA4_PROPERTY_ID`,
    dateRanges: [
      {
        startDate: '2026-03-01',
        endDate: 'today',
      },
    ],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'conversions' },
    ],
  });

  return response;
}

getMetrics().then(data => {
  // Save to Mission Control
  console.log('✓ GA4 metrics synced');
});
```

**Install:** `npm install @google-analytics/data`

---

## Real-Time Database (Phase 3 - Future)

For true real-time updates without polling:

**Option 1: Airtable** (easiest)
- Host lead tracker in Airtable
- Airtable has free API
- Dashboard polls it every minute
- No code needed, just configure

**Option 2: Supabase** (most flexible)
- Open-source Firebase alternative
- Real-time subscriptions
- Free tier included
- Dashboard auto-updates when data changes

**Option 3: Firebase** (if you scale)
- Google's real-time database
- Perfect for dashboards
- Auto-sync across devices

---

## Weekly Ops Review (Using Real-Time Data)

Every Sunday, review:

```
WEEK RECAP (Mar 1-7)
━━━━━━━━━━━━━━━━━━━━━━
Lead Gen
├─ Calls made: 21 (target: 21) ✓
├─ Posts made: 14 (target: 14) ✓
└─ New leads: 8

Conversion
├─ Consultations: 2
├─ Estimates sent: 1
└─ Signed: 0 (next target)

Website
├─ Visitors: 187 (target: 210)
├─ Form fills: 3
└─ Bounce rate: 58%

Pipeline
├─ Total prospects: 28
├─ Pipeline value: $127K
└─ Avg close time: 12 days

Action Items for Next Week
├─ [ ] Improve website bounce rate (fix copy? speed?)
├─ [ ] Follow up on 2 "negotiate" stage prospects
└─ [ ] Increase social reach (try different time?)
```

---

## Mission Control File Location

**Current:** `C:\Users\trisd\clawd\mission-control/`

**Key files:**
- `mission-control/app.js` — Main dashboard app
- `mission-control/data/metrics.json` — Current metrics
- `mission-control/data/mission-control-metrics.json` — Real-time data (NEW)

**To update Mission Control:**
1. Edit the metrics JSON
2. Refresh localhost:3001
3. Dashboard reflects changes instantly

---

## Quick Win: Add This Widget Today

**Simple addition to Mission Control UI (HTML):**

```html
<div class="widget revenue-critical">
  <h3>🎯 Lead Pipeline Status</h3>
  <div class="metric">
    <span class="label">Total Leads:</span>
    <span class="value">28</span>
  </div>
  <div class="metric">
    <span class="label">Conversion Rate:</span>
    <span class="value">3.6%</span>
  </div>
  <div class="metric">
    <span class="label">Pipeline Value:</span>
    <span class="value">$127,400</span>
  </div>
  <div class="metric">
    <span class="label">Next Target:</span>
    <span class="value">2 more signed this month</span>
  </div>
</div>
```

**This gives Tris instant visibility into sales health every time he checks the dashboard.**

---

## Success Metrics

Mission Control is **working** when:

✅ Tris checks it every morning (yes/no?)
✅ It shows him exactly where prospects are stuck
✅ He can see daily progress toward lead gen targets
✅ Website data confirms or disproves marketing efforts
✅ It becomes his morning briefing (no other reports needed)

**If he's not using it:** Simplify it. Real estate investors and contractors want 3 numbers: leads, close rate, pipeline value. That's it.
