# PostForge Rebuild Plan
## From "AI Agent" → "Pure Clipping Platform"

**Goal:** Strip agent complexity, keep only: Clipping + Analytics + Auto-Posting

**Timeline:** ~2 hours (autonomous build)

---

## What's Being Deleted

### Files to Remove
- `agent.js` — Persistent memory system (DELETED)
- `agent-dashboard.html` — Agent UI (DELETED)
- `/api/agent/*` endpoints (DELETED)
- Agent learning logic (DELETED)
- Approval queue system (DELETED)

### Code to Clean Up
- Remove `agent.js` imports from `server.js`
- Remove `/api/agent` routes
- Remove agent memory from Redis schema
- Simplify user table (no "businessMemory" field)
- Remove "learning" from analytics

---

## What's Being Kept

✅ **Clipping Engine** (`/api/clips/*`)
- Upload video
- Transcribe (Whisper)
- Analyze (Claude finds viral moments)
- Cut (FFmpeg)
- Download clips

✅ **Auto-Posting** (`/api/social/*`)
- Twitter, Instagram, LinkedIn, Facebook, TikTok OAuth
- Auto-post clips to all platforms
- Track which platform each clip posted to

✅ **Analytics** (`/api/analytics/*`)
- Track clip performance per platform
- Views, engagement, saves per clip
- Platform breakdown
- Strategy insights based on data

✅ **Authentication**
- User login/signup
- Session management
- API keys

✅ **Pricing Tiers**
- Free: 5 clips/month
- Growth: 50 clips/month ($19)
- Pro: 150 clips/month ($49)
- Business: 500 clips/month ($99)

---

## Database Schema (Simplified)

```javascript
// Users table (no agent fields)
users {
  id
  email
  password
  tier: "free" | "growth" | "pro" | "business"
  created_at
  updated_at
}

// Clips table (core)
clips {
  id
  user_id
  original_video_url
  transcript_text
  viral_moments: [{start, end, confidence}]
  created_at
  status: "uploaded" | "processing" | "ready"
}

// Clip outputs (for each moment cut)
clip_outputs {
  id
  clip_id
  video_url (MP4)
  caption_style: "hormozi" | "minimal" | "karaoke" | "impact"
  duration: seconds
  created_at
}

// Posts (track where clips are posted)
posts {
  id
  clip_output_id
  platform: "twitter" | "instagram" | "linkedin" | "facebook" | "tiktok"
  post_id (from platform)
  posted_at
}

// Analytics (platform performance)
analytics {
  id
  post_id
  platform
  views
  likes
  shares
  comments
  saves
  fetched_at
}
```

---

## Remaining Work

### Backend
1. Delete `agent.js` + agent routes
2. Simplify `server.js` (remove agent imports)
3. Ensure `/api/clips/*` works standalone
4. Ensure `/api/social/*` works standalone
5. Build `/api/analytics/*` to query posts table + platform metrics
6. Add TikTok OAuth to social posting

### Frontend
1. Delete `agent-dashboard.html` from nav
2. Update nav: Home, Create, Clips, Analytics, Settings
3. Analytics page: show clip performance per platform
4. Insights page: show strategy recommendations ("TikToks outperform 2:1")

### Testing
1. Upload video → generate clips (✅ should work)
2. Post clips to Twitter (✅ should work)
3. Post clips to Instagram (✅ should work)
4. Post clips to LinkedIn (✅ should work)
5. Post clips to Facebook (✅ should work)
6. Post clips to TikTok (⏳ adding now)
7. Analytics tracking (⏳ building)
8. Strategy insights (⏳ building)

---

## Estimated Timeline

| Task | Time | Status |
|------|------|--------|
| Delete agent code | 15 min | Starting |
| Clean server.js | 10 min | Waiting |
| Add TikTok OAuth | 20 min | Waiting |
| Build analytics endpoints | 30 min | Waiting |
| Build analytics UI | 20 min | Waiting |
| Test all features | 15 min | Waiting |
| Deploy | 5 min | Waiting |
| **Total** | **~115 min** | |

**Launch ready:** ~2-3 hours from now

---

## Post-Launch Quick Wins

### Week 1 (Post-Launch)
- Get 100+ free signups
- Gather user feedback
- Fix bugs (if any)
- Add testimonials to landing page

### Week 2
- Add competitive tracking (monitor what competitors post)
- Improve analytics UI (more detailed breakdowns)
- Add email sequences for free → paid
- Consider $9/mo tier if demand for lighter option

### Week 3+
- API key system for developers
- White-label option for agencies
- Advanced analytics (trending topics, optimal posting times)

---

**Executing now. Ship in 2-3 hours.**
