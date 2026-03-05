---
name: market-gap-finder
description: Find profitable market gaps by scanning Reddit, HackerNews, X, and product review sites for unmet needs, pain points, and underserved markets. Generates actionable opportunity reports with competitive analysis and build recommendations. Use when asked to find business ideas, market opportunities, startup ideas, product gaps, underserved niches, or 'what should I build'.
---

# Market Gap Finder

Discover profitable opportunities by analyzing what real people complain about online.

## Process

1. **Define search scope:**
   - Industry/vertical (or "any")
   - Budget range (bootstrapped / funded)
   - Skills available (code, design, marketing, all)
   - Timeline (ship in days / weeks / months)

2. **Scan platforms for pain signals:**

### Reddit
Scan these subreddits for complaints, wishes, and frustrations:
- r/SaaS, r/startups, r/Entrepreneur, r/smallbusiness
- r/webdev, r/programming, r/productivity
- Industry-specific subs based on scope
- Sort by: hot, top (week), top (month)

### HackerNews
- "Ask HN" and "Show HN" posts
- Comment threads with high engagement
- "I wish..." and "Why isn't there..." patterns

### Pain Signal Keywords
Search for posts containing:
- "I wish there was", "why isn't there", "someone should build"
- "I'd pay for", "so frustrated with", "looking for alternative to"
- "switched from", "tired of", "hate how", "overpriced"
- "shut up and take my money", "would kill for"

3. **Score each opportunity (0-100):**

| Factor | Weight | Scoring |
|--------|--------|---------|
| Demand signals (upvotes, comments) | 25% | >500 engagement = high |
| Pain intensity (signal keywords) | 25% | Multiple signals = high |
| Buildability (can you ship MVP fast?) | 20% | Web app/tool = easy |
| Revenue potential (will people pay?) | 15% | B2B > B2C |
| Competition gaps (weak alternatives?) | 15% | Bad reviews on competitors = opportunity |

4. **Output opportunity report:**

For each opportunity (top 5-10):
```
## Opportunity: [Title]
- **Source**: [URL]
- **Score**: [X/100]
- **Pain point**: [What people are frustrated about]
- **Existing solutions**: [Competitors and their weaknesses]
- **Proposed solution**: [What to build]
- **Revenue model**: [How it makes money]
- **MVP scope**: [What to ship in 48 hours]
- **Tech stack**: [Recommended tools]
- **First 10 customers**: [Where to find them]
```

## Key Principles
- Real pain > cool idea. Only surface opportunities with evidence of demand.
- Speed wins. Prefer opportunities where MVP ships in days, not months.
- Revenue from day one. Skip "build audience first" plays.
- Links to sources. Every opportunity must link to the original post/thread.
