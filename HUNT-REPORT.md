# Craigslist Homeowner Lead Hunt - Strict Validation Report

**Date:** February 28, 2026  
**Time:** 3:30 AM CST (After 4 PM scheduled hunt window expired)  
**Location:** Chicago Area (Craigslist)  
**Execution Mode:** Automated Brave API scan + strict manual validation  

## Executive Summary

**Total Listings Reviewed:** 15  
**Valid Homeowner Leads Found:** 0  
**Quality Score:** 0% ❌  
**Status:** NO LEADS READY FOR OUTREACH

---

## Detailed Findings

### Automated Scan Results (Brave Search API)

#### Contractor Advertisements Filtered Out (9 leads)
These violated "red flag" criteria by using contractor language:

| Title | Red Flag Detected |
|-------|------------------|
| Kitchen & Bathroom Remodel (Addison) | "Family owned Construction Business with 30 years of experience" |
| Hallmark Home Improvements | Phone: 630-383-6939, company name, "Call me" |
| Bathroom Remodeling (NWC) | "We offer", "Licensed & Insured", "5-Star Reviews" |
| Bathroom/Kitchen Remodel (Bensenville) | "Family-run business", "contractor-financed" |
| Complete Home Remodeling (Chicago) | "I'm an independent contractor" |
| Drywall Repair/Painting Handyman (Willowbrook) | "Local older Handyman who specializes..." |
| Handyman/Painter/Drywall/Electrical | Generic contractor offering template |
| Gary's Handyman Services (Vernon Hills) | Company name, generic service listing |
| Newspaper Delivery Contractors | "Seeking Independent Contractors" (job posting) |

#### Product Sales / Irrelevant (4 leads)
| Item | Category | Issue |
|------|----------|-------|
| Floor Fan / Drying Mats | Business/Commercial | Not a project lead |
| Wide Plank Hardwood Flooring | Materials Dealer | Selling materials, not seeking help |
| Full Bathroom Remodel - $5000 Labor | Vague Posting | No context, likely contractor | 
| Bathroom Home Remodeling Handyman (Steger) | Generic | Insufficient data |

### Validation Criteria Applied

**PASSED:** Must have ALL of these
- [ ] First-person pronouns ("I", "we", "my", "our") requesting help
- [ ] Zero contractor language ("we offer", "licensed & insured", "family owned")
- [ ] No company names, phone numbers, or business terms
- [ ] Specific project mentioned (not generic categories)
- [ ] Budget or timeline signals present

**FAILED:** If any of these appear
- ❌ "years of experience" / "family owned" / "family-run"
- ❌ "we specialize" / "we offer" / "we do"
- ❌ "licensed and insured"
- ❌ Phone numbers or company names
- ❌ Business directory language
- ❌ Job posting language ("seeking contractors", "W2/1099", "employment")

---

## Why the 0% Result?

### Problem 1: Search Strategy Issue
The Brave API queries used phrases like `"looking for" OR "need"`, which appear in:
- **Homeowner requests**: "Looking for someone to paint my bedroom"
- **Contractor ads**: "Need help? Looking for professional painters?"

Craigslist's mixed categorization returns both, requiring manual filtering.

### Problem 2: Category Contamination
Results pulled from:
- `skilled trade services` → Almost all contractor offerings
- `household services` → Mix of both + contractors
- `labor/hauling/moving` → Job postings + independent contractors

These categories are designed for PROVIDERS, not SEEKERS.

### Problem 3: Craigslist's Structure
Homeowners asking for help often post in:
- Community discussions (not indexed by API)
- Specific neighborhood sections (smaller audience)
- Private group posts (not publicly searchable)

Meanwhile, contractors dominate the "services" sections.

---

## Quality Metrics

| Metric | Value |
|--------|-------|
| Listings Scanned | 15 |
| Contractor Ads | 9 | 
| Job Postings | 2 |
| Product Sales | 2 |
| Genuinely Valid Leads | 0 |
| **Quality Score** | **0%** |
| False Positives | 15/15 (100%) |

---

## Recommended Improvements

### For Next Hunt Cycle:

1. **Search Category Restriction**
   - Exclude: "skilled trade services", "services"
   - Focus: "community" posts, "housing wanted/offered"

2. **Enhanced Negative Filters**
   - Add: `-"we offer" -"licensed" -"insurance" -"years"`
   - Add: `-"family owned" -"contractor" -"call us"`

3. **Alternative Sources (Higher Conversion)**
   - Facebook Neighborhood Groups (verified homeowners)
   - Nextdoor.com (geofenced, real residents)
   - Yelp Reviews (people asking for recommendations)
   - Google Local (business Q&A sections)

4. **Manual Review Process**
   - Set up human spot-check for top 20 results
   - Verify first 3 sentences contain homeowner language
   - Check for personal stakes ("my home", "our kitchen")

---

## Follow-Up Actions

- [ ] Update lead-scanner.js to exclude contractor-heavy categories
- [ ] Add second-stage filtering for pronoun detection
- [ ] Pivot secondary source to Facebook neighborhood groups
- [ ] Schedule manual Craigslist review for high-value search terms
- [ ] Consider Nextdoor.com as primary lead source

---

## Next Hunt Window

**Previous:** Friday, Feb 27 @ 4:00 PM (Expired)  
**Next:** Saturday, Feb 28 @ 4:00 PM  
**Strategy:** Enhanced filtering + Facebook group expansion

---

**Generated:** 2026-02-28 03:30 CST  
**Report Status:** COMPLETE  
**Action Needed:** Refine search parameters before next scheduled hunt
