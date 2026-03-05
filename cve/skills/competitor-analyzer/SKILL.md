---
name: competitor-analyzer
description: Analyze competitors for any business by scanning their website, social media, reviews, and pricing. Generates a full competitive analysis report with strengths, weaknesses, opportunities, and actionable recommendations. Use when asked to analyze competitors, compare businesses, research market landscape, or find competitive advantages.
---

# Competitor Analyzer

Deep-dive competitive analysis for any business or market.

## Usage

When triggered, collect:
1. **Your business** — name, type, location
2. **Competitors** — names/URLs (or ask to find them)
3. **Analysis depth** — quick (top 3) or deep (top 10)

## Analysis Framework

### For Each Competitor, Evaluate:

1. **Online Presence**
   - Website quality (design, speed, mobile, SEO)
   - Social media activity (platforms, frequency, engagement)
   - Google Business Profile (reviews, rating, photos)
   - Content marketing (blog, video, podcast)

2. **Pricing & Positioning**
   - Price range vs market
   - Value proposition
   - Target customer segment
   - Unique selling points

3. **Reputation**
   - Review score + count (Google, Yelp, BBB)
   - Common complaints in reviews
   - Common praise in reviews
   - Response to negative reviews

4. **Weaknesses to Exploit**
   - Slow response time?
   - Poor website/mobile experience?
   - No social media presence?
   - Bad reviews on specific issues?
   - Overpriced for market?

## Output Format

```
# Competitive Analysis: [Your Business] vs [Market]

## Market Overview
[Summary of competitive landscape]

## Competitor Breakdown

### [Competitor 1]
- **Website**: [score/10] — [notes]
- **Social**: [platforms, follower count, post frequency]
- **Reviews**: [rating] ([count] reviews) — [sentiment]
- **Pricing**: [range]
- **Strengths**: [list]
- **Weaknesses**: [list]

[Repeat for each competitor]

## Your Competitive Advantages
[Based on analysis, where you can win]

## Action Items
1. [Specific action to take]
2. [Specific action to take]
3. [Specific action to take]
```

## Data Sources

Use browser to check: Google search, Google Maps, Yelp, social media profiles, competitor websites. Use web search for market data and pricing benchmarks.
