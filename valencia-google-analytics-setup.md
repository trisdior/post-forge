# Google Analytics 4 Setup for Valencia Construction

## Setup Instructions (for Tris to implement)

### Step 1: Create GA4 Property
1. Go to [Google Analytics](https://analytics.google.com)
2. Click **+ Create** → **Account**
3. Account name: `Valencia Construction`
4. Property name: `valenciaconstructionchi.com`
5. Reporting timezone: `America/Chicago`
6. Currency: `USD`

### Step 2: Get Measurement ID
After creating property, you'll see:
- **Measurement ID:** `G-XXXXXXXXXX` (save this)

### Step 3: Add GA4 Tracking Code to WordPress

#### Option A: Using WP Code Snippets (RECOMMENDED - Easier)
1. In WordPress, go to **Tools → Code Snippets → Add New**
2. Title: `Google Analytics 4 Tracking Code`
3. Paste this code:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-YOUR_MEASUREMENT_ID', {
    'page_path': window.location.pathname,
  });
</script>
```

4. Replace `G-YOUR_MEASUREMENT_ID` with your actual Measurement ID
5. Set to run everywhere on frontend
6. Save & Activate

#### Option B: Using Bluehost (if WP Code Snippets unavailable)
1. Go to **WordPress Admin → Appearance → Header Code**
2. Paste the same GA4 code
3. Save

### Step 4: Verify Installation
1. Go to your website: `valenciaconstructionchi.com`
2. Open browser DevTools (F12 → Network tab)
3. Look for requests to `googletagmanager.com` or `google-analytics.com`
4. In Google Analytics, go **Admin → Property → Data Streams → Web → Your Stream**
5. Click **View tag assistant** — should show "Tag installed and firing"

---

## What GA4 Tracks (AUTOMATICALLY)

✅ **Page views** — How many people visit each page
✅ **Sessions** — Unique visitor sessions
✅ **Traffic source** — Google, Facebook, direct, etc.
✅ **Device type** — Mobile vs desktop
✅ **Form submissions** — Contact form fills
✅ **Scroll depth** — How far down pages people read
✅ **Time on page** — Engagement metric
✅ **Bounce rate** — % of single-page visits

---

## CRITICAL: Set Up Lead Tracking (Custom Events)

### Add Event Tracking to Contact Form
This ensures you can see when someone submits the form.

**For WPForms Plugin:**

1. Edit your contact form
2. Go to **Settings → Confirmation**
3. Add this code to custom confirmation:

```javascript
<script>
gtag('event', 'form_submission', {
  'form_name': 'contact_form',
  'timestamp': new Date().toISOString()
});
</script>
```

**For Contact Form 7:**

1. Edit form → **Settings → Custom meta tags**
2. Add:

```html
<script>
document.addEventListener('wpcf7mailsent', function() {
  gtag('event', 'form_submission', {
    'form_name': 'contact_form_7',
  });
}, false);
</script>
```

---

## Dashboard Setup (What to Monitor Daily)

### Key Metrics to Track
```
✅ Daily Visitors (goal: 30+ per day = strong)
✅ Bounce Rate (goal: <60% = good content)
✅ Form Submissions (goal: 2-5 per week = pipeline)
✅ Traffic Source (where are leads coming from?)
✅ Top Pages (which services are people interested in?)
```

### Set Up Alerts
1. Go to **Admin → Reporting Features → Anomaly Alerts**
2. Enable alerts for:
   - Sudden traffic drop (investigate immediately)
   - Sudden spike (capitalize on it)

---

## Revenue Connection

| Metric | Insight |
|--------|---------|
| **Traffic Source** | If Facebook = 60% of traffic, double down on FB ads |
| **Top Pages** | If Kitchen Remodel page = 40% of traffic, it's a winner |
| **Bounce Rate** | High bounce = bad copy/UX (fix it) |
| **Form Submissions** | Track form fills = direct measure of lead quality |
| **Mobile vs Desktop** | If 70% mobile, mobile optimization is CRITICAL |

---

## Reporting Dashboard (Free)

### Create a Custom Report:
1. In GA4, go **Reports → Create custom report** (or use built-in dashboard)
2. Add widgets:
   - **Total Users** (past 7 days)
   - **Form Submissions** (past 7 days)
   - **Top Pages** (ranked by sessions)
   - **Traffic by Source** (pie chart)

3. Save as "Valencia Daily Dashboard"
4. Check it every Monday morning (2 min to see if site is working)

---

## Next Steps (after setup)

- Week 2: Review traffic data — are people visiting?
- Week 3: Check form submissions — are people interested?
- Week 4: Optimize top performers — double down on what's working

**Without GA4, you're flying blind. Install this now.**
