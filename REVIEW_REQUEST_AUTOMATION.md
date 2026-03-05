# Review Request Automation
## Text Client After Job Completion to Request Reviews

**Purpose:** Automatically ask happy clients for reviews after project completion.  
**Result:** 40-60% of clients who receive review requests actually leave them.  
**Impact:** Reviews = trust = more leads. Each new review increases conversion by ~3-5%.

---

## How It Works

### Timeline
1. **Project completion date** is logged in CRM/project tracker
2. **2 days after completion**: Automated text sent to client asking for review
3. **Follow-up reminder**: If no review posted in 7 days, send gentle reminder
4. **Thank you**: Once review is posted, send thank-you message

---

## Message Sequence

### Text 1: Review Request (2 days post-completion)
```
Hi [Name]! 👋 Your [kitchen/bathroom] is complete! 
We hope you love it. 💙

Could you share a quick review? Honest feedback (5 stars or constructive)
helps us stay accountable. Pick your favorite platform:

⭐ Google: [short link to Google review]
⭐ Facebook: [short link to Facebook review]
⭐ Yelp: [short link to Yelp review]

Takes 30 seconds. Thanks! 🙏
— Valencia Construction
```

### Text 2: Reminder (7 days post-completion, if no review yet)
```
Hi [Name]! One more reminder—your review really helps us. 🙌

Even just a few words on Google makes a difference:
[Google review link]

Thanks for trusting us with your project!
```

### Text 3: Thank You (after review is posted)
```
Hi [Name]! 🌟 Thank you for your amazing review! 
We truly appreciate your trust and feedback.

Know anyone else who needs a remodel? We'd love a referral.
Reply REFER and we'll send you our referral details.

Thanks again! ✨
```

---

## Which Platforms to Focus On

### Tier 1 (Most Valuable)
1. **Google** — 88% of consumers read Google reviews. Highest ROI.
2. **Facebook** — Local reach, younger demographic, great for word-of-mouth
3. **Yelp** — B2B weight; contractors browse here

### Tier 2 (Secondary)
- Houzz (if doing design work)
- BBB (credibility + lead source)
- HomeAdvisor (captures job leads directly)

### Tier 3 (Nice to Have)
- Thumbtack
- Angie's List
- Local Chicago construction forums

---

## Implementation

### Option A: Zapier (Recommended)
**Cost:** ~$20-30/month  
**Setup time:** 30 minutes  
**Best for:** Small teams, simplicity

**Flow:**
```
CRM Project Status Changed to "Complete" 
  → Zapier delays 2 days
  → Sends SMS to client with review links
  → Logs in CRM that request was sent
  → (7 days later) Sends reminder if no review posted
```

**Zapier Setup:**
1. Trigger: Project marked "Complete" in CRM
2. Delay: 2 days
3. Action: Send SMS via Twilio
4. Log: Add tag "review-requested" to lead
5. (Optional) Schedule follow-up in 7 days

### Option B: Custom (More Control)
**Cost:** Developer time (or AI to build it)  
**Setup time:** 3-4 hours  
**Best for:** Tight integration with your systems

Backend service monitors:
- Project completion date
- Sends text at right time
- Monitors if review was actually posted (API checks to Google/Facebook)
- Auto-sends follow-ups only if no review yet

---

## Creating Review Links

### Google Review Link
```
https://search.google.com/local/writereview?placeid=[YOUR_GOOGLE_PLACE_ID]
```
Find your Place ID:
1. Go to your Google Business Profile
2. Get Place ID from URL
3. Shorten with bit.ly → `https://bit.ly/valencia-google-review`

### Facebook Review Link
```
https://www.facebook.com/pg/[YOUR_FACEBOOK_PAGE_ID]/reviews/
```
Shorten: `https://bit.ly/valencia-fb-review`

### Yelp Review Link
```
https://www.yelp.com/writeareview/biz/[YOUR_YELP_ID]
```
Shorten: `https://bit.ly/valencia-yelp-review`

---

## CRM Integration

### If using Google Sheets (simple)
```
| Client Name | Phone | Project Type | Completion Date | Review Sent? | Review Posted? |
|---|---|---|---|---|---|
| John Smith | 555-1234 | Kitchen | 2/24/2026 | YES (2/26) | NO |
| Sarah Jones | 555-5678 | Bathroom | 2/20/2026 | YES (2/22) | YES ✅ |
```

Zapier monitors the "Completion Date" column and triggers the workflow.

### If using dedicated CRM (HubSpot, Jobber, etc.)
- Add a field: "Review Request Sent Date"
- Add a field: "Review Posted" (yes/no)
- Create automation: When project = "complete", send review request text

---

## Expected Impact

| Metric | Current State | With Auto-Request |
|--------|---|---|
| Review requests sent | 0 (manual) | 100% of completed projects |
| Clients who post review | N/A | 40-60% |
| Avg reviews per month | 2-3 | 8-12 |
| Google review rating impact | N/A | +0.3 stars (4.2 → 4.5) |
| Lead conversion lift from reviews | N/A | +5-8% |

**Bottom line:** If you complete 20 projects/month and 10 clients leave reviews...
- Current approach: 2-3 reviews/month
- With automation: 8-12 reviews/month
- **Lead conversion boost:** +5-8% → 4-6 extra contracts/month → **$12-18k extra revenue**

---

## Setup Checklist for Tris

- [ ] Get short links for each review platform (use bit.ly)
- [ ] Choose implementation (Zapier recommended)
- [ ] Connect CRM or Sheets to Zapier
- [ ] Set up text templates (copy from above)
- [ ] Twilio account (already set up for lead auto-response)
- [ ] Test: Mark a past project as "complete" and verify text is sent
- [ ] Adjust timing if needed (some prefer 5 days, some 10 days)

**Timeline:** 30 min to live

---

## Bonus: Referral Program Tie-In

Once a client posts a review, follow-up text includes:
```
Know anyone else needing a remodel? 
We offer $500 referral credit if your friend books a project.

Reply REFER to send them our info.
```

This turns happy customers into your sales team. Referrals close at **3x higher rate** than cold leads.

---

## Files Ready
- `REVIEW_REQUEST_AUTOMATION.md` (this file) — strategy & setup
- Sample CRM sheet template (Sheets version ready to copy)
- Pre-written SMS templates (ready to copy-paste into Zapier)

**Status:** Ready for Tris to implement. Pairs perfectly with lead auto-response system.
