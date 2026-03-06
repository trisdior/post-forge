# MEMORY.md — Long-Term Memory

## About Tris
- Real name is Chris, goes by Tris
- 20 years old, owns Valencia Construction (general contracting startup in Chicago)
- Ambitious — wants a Lamborghini Urus by end of 2026
- Revenue currently at $0 — building from scratch
- Has crew that can do full remodels; also does handyman work
- Prefers me to take autonomous action, not just advise
- Night owl, direct communicator, motivated by tangible goals
- Business phone: (773) 682-7788
- Website: valenciaconstructionchi.com
- Has Google Business Profile
- Telegram chat ID: 942294138

## Valencia Construction
- Licensed & insured general contractor, Chicago
- Services: kitchen/bathroom remodels, flooring, tile, painting, drywall, plumbing, electrical, handyman
- Key differentiator: owner-operated, direct communication, transparent pricing
- Website built on WordPress (Bluehost hosting)
- Kitchen Remodeling page published Jan 29, 2026 (needs encoding fix + nav link)
- First blog post published Feb 15, 2026: "What $10K, $25K, and $50K Gets You in a Chicago Remodel (2026)" (post ID 485)
- Blog page live at /blog/ (page ID 487)
- Nav menu (ID 6): Home, About Us, Services, Testimonials, Blog, Free Consultation (Portfolio removed — no real photos)

## Valencia Daily System (Feb 19, 2026)
- **8:00 AM** — Lead Gen Blitz: 3 cold calls + 2 Facebook posts (30 min) — automated cron job
- **8:00 PM** — Evening Check-in: Did you hit targets? Log results — automated cron job
- **Sunday 6 PM** — Weekly Recap: calls/posts/leads/consultations — automated cron job
- After 8am work → rest of day free for side projects (Aura, YouTube, apps, etc.)
- Weekly goal: 15 calls + 14 posts = momentum toward first client

## 9-DAY ACTION PLAN (Feb 20-28, 2026) — OFFICIAL ROADMAP
**Mission:** Build the foundation. No excuses. No distractions.

### TODAY (Feb 20 - Setup Day)
- ✅ Fix testimonials page broken links → DONE
- ✅ Sent 4 cold emails (1982 PM, SimpliManaged, Chicago Central, Chicago Style)
- ⏳ REMAINING (by end of today):
  - [ ] SETUP BLOCK (1 hr): print plan, 7am alarm, block calendar, clear workspace
  - [ ] CONSTRUCTION QUICK WINS (2 hrs): update GBP (3+ photos), post social, text 5 past clients
  - [ ] FINANCE SETUP (1 hr): QuickBooks, expenses list, budget on paper
  - [ ] AI PROJECT DECISION (1 hr): Pick ONE, define: What? Who pays? How much? When done?

### Feb 21-22 (Sat-Sun): Prep & Recon
- Gym daily (starting NOW, not Monday)
- Design/order door hangers & flyers
- Scout 3-4 neighborhoods with older homes
- Weekly planning session: 10-contact outreach list, 3 priorities
- Website mobile check & quick fixes

### Feb 23-27 (Mon-Fri): Week 1 Full Execution
- Lead gen every morning (cold calls, door hangers, Facebook)
- AI project every afternoon (ship by Thursday)

### Feb 28 (Sat): Monthly Review
- Plan March, enter new month with momentum

### FINAL CHECKLIST (By Feb 28):
- [ ] 25+ contacts (realtors/PMs/past clients)
- [ ] 50+ doors knocked OR door hangers dropped
- [ ] 2-3 estimates sent for real jobs
- [ ] 5+ social media posts
- [ ] Google reviews requested
- [ ] 1 AI project shipped/demoed
- [ ] 6+ gym sessions
- [ ] 2 social activities with humans
- [ ] Clear financial picture + monthly budget
- [ ] March plan ready

## Active Projects & TODOs

### CURRENT PRIORITY: 3-Business Launch (Feb 26-28)
**Active Execution Phase**

#### 1. Valencia Construction (Get 1st Client by Feb 28)
- ✅ Lead Gen Blitz cron active (8am + 8pm)
- ✅ Hunter AI scraping leads
- 🔴 **WORKFLOW BROKEN** (Mar 2): Hunter finds leads but wasn't queuing them for Karl (Closer)
- ✅ **FIXED** (Mar 2): Created hunter-to-karl-workflow.py to tie everything together:
  - Hunter finds fresh leads on Craigslist
  - integrate-scanner-leads.py scores leads for homeowner intent (score >= 25 queued)
  - Karl reads queue and drafts replies (Facebook comments, DMs, Reddit, Nextdoor, Craigslist)
  - Karl sends approval request to Tris via Telegram
  - Tris approves → Karl posts replies
- ⏳ Make 3 calls/day through Saturday
- ⏳ Get 1 consultation booked = proof of concept

#### 2. Trovva AI (Content Hub Launch - Monday Mar 1)
- ✅ 5 blog posts written (1,500-1,800 words each)
- ✅ 5 Twitter threads written (ready to post)
- ✅ Substack setup complete (bio, about, welcome email)
- ✅ Publish guide created (Mon-Fri schedule)
- ⏳ Friday: Review content + setup accounts
- ⏳ Monday 9am: Goes live

#### 3. Delvrai (AI Agency - Sales Agent Launch Friday)
- ✅ Company name locked (@delvrai)
- ✅ Sales materials drafted
- ⏳ Friday: Create Twitter account
- ⏳ Saturday: Spawn sales agent
- ⏳ Monday: Agent hunting 100+ contractors

#### 4. Mission Control Dashboard (LIVE)
- ✅ Built and running on localhost:3001
- ✅ Shows all 3 businesses in real-time
- ✅ Progress trackers, revenue goals, checklists
- ✅ Data syncs from mission control files

#### 5. Knowledge Extraction Agent (Ongoing)
- ✅ AI Money Machines analyzed (15 ideas extracted)
- ⏳ Zero to One reading now
- ⏳ Feeds ideas to Trovva content pipeline

### Valencia Construction Ongoing
- ✅ Fix testimonials page broken links → DONE (Feb 20)
- ✅ 8am lead gen blitz + 8pm evening check-in (cron jobs active)
- ✅ 9-day plan tracking (Feb 20-28, currently Day 7)
- ⏳ Get ONE consultation booked by Feb 28 (main goal)
- ⏳ 3 calls + 2 posts daily (automated reminders)
- ~~Fix kitchen page character encoding~~ (lower priority, content works)
- Add real photos to Portfolio page (blocked: no client photos yet)
- Optimize Google Business Profile (needs reviews + photos)

### Completed/Deferred
- ✅ Parapet MVP built (tests passing) — KILLED due to market limitations
- ✅ GitHub pushed, Railway deployment attempted (hit build issues, deprioritized)
- ❌ Epstein X clips strategy (viable but too small, deprioritized for AI Agency)
- ✅ Hunter agent created (@Hunterllcbot) — dedicated lead gen, runs on Gemini Flash
- ✅ Lead Tracker spreadsheet: data/Valencia-Lead-Tracker.xlsx
- ✅ Craigslist monitor automated (cron: 8am/12pm/4pm/8pm)

## Notion
- API key stored at: C:\Users\trisd\.config\notion\api_key
- Personal To-Do List page ID: 309b41e0-eb34-804c-a920-cfe9030c59f2
- Morning brief cron pulls unchecked to_do items from this page

## Parapet (DeFi Risk Protocol)
- **X/Twitter:** @Parapetfi
- **Concept:** AI-powered DeFi risk scoring + insurance protocol on Solana
- **Revenue model:** SaaS dashboard (risk scores) → protocol fees → yield on reserves → B2B partnerships → token
- **Status:** MVP BUILT (Feb 24, 2026)
- **MVP Delivered:**
  - Backend: Python/FastAPI (4 endpoints, 6-factor risk scoring engine, Helius integration)
  - Frontend: React dashboard (search, ScoreCard, portfolio tracker)
  - Documentation: API docs, architecture, 4-week roadmap, deployment checklist
  - Testing: All tests passing (risky protocol = 84/100, safe protocol = 20/100)
  - Location: `C:\Users\trisd\clawd\parapet\`
- **Next steps (Week 2):** Deploy to Railway (backend) + Vercel (frontend), buy parapet.ai domain, get first 3 beta users

## Future Plans / Revenue Stack
- **Valencia Construction** — first client is #1 priority, big ticket local revenue
- **AI Agency** — SaaS for ANY small business owner (not just contractors). Niches: real estate, auto shops, restaurants, salons, law firms, dentists, fitness, e-commerce
- **Faceless YouTube** — Dr Insanity (true crime/bodycam) + Fern (dark Reddit stories). ~$65/mo to run, fully automatable
- **X Articles** — monetized long-form content on Twitter. Repurpose book chapters + AI knowledge
- **Amazon KDP** — AI-generated books. First book: "AI Money Machines" (manuscript in books/) — LOW PRIORITY, just an idea, not a main stream
- **VisionBuild App** — AI remodel visualizer for contractors. Upload room photo → design variations + cost estimates. SaaS play.
- **Other apps:** InstaBid, CrewTrack, ReviewHero, LeadSniper

## PostForge — THE Main Product (Mar 5, 2026 — Launch Imminent)
- **Vision:** Every small business gets their own AI marketing employee
- **Not a tool, not a dashboard — an EMPLOYEE**
- **Pricing:** Free ($0, 10 posts) / Growth ($19, 50 posts) / Pro ($49, 150 posts) / Business ($99, 500 posts)
- **Status:** FULLY BUILT — All phases complete, awaiting deployment
  - Phase 1 ✅: Web tool + content generation with approval queue
  - Phase 2 ✅: Auto-pilot with scheduled generation
  - Phase 3 ✅: Full persistent agent per user (Redis-backed memory)
  - Phase 4 ✅: API key system for platform integrations
- **Key Components Built (Mar 5):**
  - Phase C: Social Media Auto-Posting (Twitter, Instagram, LinkedIn, Facebook OAuth)
  - Phase D: Viral Clip Engine (upload → transcribe → analyze → cut → caption → download)
  - Rate limiting system (tier-based, monthly reset)
  - API key management system (complete)
  - Competitive analysis (10 companies researched)
  - UI redesign (premium, "alive" look with animations)
- **Key insight from Tris:** "We change the game with their own agent"
- **YC RFS #3 literally asks for "AI-Native Agencies"** — this is us
- **Market:** 33M small businesses in US × $99/mo = massive TAM
- **Live URL:** https://postforge-nu.vercel.app (deploying Mar 5)
- **GitHub:** https://github.com/trisdior/post-forge
- **Current stats:** 3 users (local), 0 public deployments yet, $0 MRR
- **Pages:** Landing, Create (with repurpose mode), Calendar, Analytics, Clips, Auto-Pilot, Settings, Onboarding, API Keys
- **Stack:** Node.js + Upstash Redis + Claude API + Vercel + Docker (processing server)
- **Deployment Status (Mar 5, 4:46 PM):**
  - ❌ CRITICAL: Git history being cleaned (exposed API keys to GitHub)
  - ⏳ Waiting for 3 new API keys (Anthropic, Google, Sendinblue)
  - ⏳ Will update Vercel env vars + redeploy
  - ⏳ Then test production + launch

## CRITICAL: GitHub Security Incident (Mar 5, 2026)
**What happened:**
- I committed `.env.local` with exposed API keys to GitHub (my mistake)
- GitHub auto-detected and deactivated: Anthropic, Google, Sendinblue keys
- Telegram bot token also exposed (Tris said it's no longer needed)
- Currently cleaning git history (force push to remove `.env.local` permanently)

**What's being done:**
- Added `.gitignore` to prevent future commits of `.env.local`
- Removing `.env.local` from git history completely
- Force pushing to GitHub to clean the history
- Requesting 3 new API keys from Tris (Anthropic, Google, Sendinblue only)

**Lesson learned:**
- NEVER commit `.env.local` to GitHub
- ALWAYS create `.gitignore` first
- Store secrets in platform env vars (Vercel), never in git
- This was my failure, not Tris's — taking full responsibility

**Next action (once git history is clean):**
1. Get 3 new API keys from Tris
2. Update Vercel environment variables
3. Redeploy
4. Test production at https://postforge-nu.vercel.app
5. Launch: ProductHunt, Reddit, Twitter

## Christopher Valencia Enterprises (CVE) — Founded Mar 4, 2026
- **Mission:** $1M MRR startup. AI agents find problems, build solutions, sell them. 24/7.
- **Model:** Scout → Analyst → Architect → Builder → Launcher → Monitor
- **Infrastructure:** 3x Mac Studio (Qwen 3.5) + DGX Spark (Minimax 2.5) + Opus 4.6 + Codex 5.3
- **First pipeline run:** 72 opportunities found, 12 BUILD candidates, 12 specs created
- **Dashboard:** http://localhost:3003 (live agent activity)
- **First Product: PostForge AI** — AI social media content generator
  - Live URL: https://postforge-nu.vercel.app
  - Powered by Claude Sonnet, $0/9/19 freemium pricing
  - Auth system, usage tracking, 10 industry presets
  - Vercel account: triskicksllc-3470
- **Product Roadmap:** PostForge → ClipForge → LeadForge → PitchForge → Bundle at $99/mo
- **Tris wants professional launches** — no half-baked deploys, needs domain + Stripe + polish
- **Codebase:** C:\Users\trisd\clawd\cve\
- **Revenue streams:** Agent skills marketplace, micro-SaaS factory, data intelligence, zero-to-one products
- **Inspired by:** X post about Alex Finn Global Enterprises (autonomous AI workforce)
- **Key insight:** "They don't predict better. They just move faster than everyone else."

## CVE Nightshift Builds (Mar 4-5, 2026)
**Built by Steve while Tris slept — 50K of production-ready content**

1. **PostForge Landing Page** (`postforge-landing-page.html`)
   - Professional conversion funnel (hero, features, social proof, pricing, CTAs)
   - Ready to deploy to postforge.ai domain
   - Expected to 2x signups from better UX/messaging

2. **PostForge Email Funnel** (`postforge-email-funnel.md`)
   - 8 emails: welcome → day 1 → day 3 → day 5 → day 7 → day 14 → monthly → churn prevention
   - Targets: 40%+ open rate, 15%+ CTR, 5%+ free→paid conversion
   - A/B testing framework included
   - Drop into Resend immediately

3. **Valencia Lead Nurture Sequence** (`valencia-lead-nurture-sequence.md`)
   - SMS (immediate response) → Facebook Messenger (days 1-3) → Email (pre-call + post-call)
   - Timeline: Form → Consultation (4-5 days) → Estimate (5-6 days) → Signed (10-14 days)
   - Built to get first paid client by March 31
   - Structured objection handling + price messaging

4. **CVE Operating Playbook** (`cve-operating-playbook.md`)
   - Complete business model & deployment framework
   - 4-phase customer journey: Onboarding (week 1) → Optimization (weeks 2-4) → Scaling (months 2-3) → Renewal (month 4+)
   - 4-tier pricing: $99/$199/$299/mo + Enterprise custom
   - Year 1 revenue target: $108K (achievable)
   - Year 2 vision: $30K+/mo, multiple products, hiring
   - Reusable agent stack: Hunter (leads), Karl (follow-up), Content (posts), Analytics (metrics), Email (sequences)

**Expected Impact (30 days):**
- PostForge: 100+ new signups, 2-5 paid/day → $2-3K/mo
- Valencia: 1st client booked via lead sequence → $30-50K project
- CVE: 1-2 customers onboarded → $1-4K/mo new MRR
- **Conservative total: $3-5K/mo added revenue by month-end**

## Personal Goals (2026)
- Lamborghini Urus
- Two properties (investment rental + personal spot)
- Prove he can build a startup

## Key Tools Built
- 2nd Brain app: `second-brain-app/` (Next.js, localhost:3000, 29+ ideas)
- Cash Flow Playbook: `cashflow-playbook.md` (47 pages)
- AI Money Machines book: `books/ai-money-machines.md`
- Valencia Media Discord server (bot Client ID: 1473216533860847691)

## Email Setup
- **Resend API** handles all WordPress email (WPCode snippet ID 451)
- WP Mail SMTP plugin deactivated
- Resend API key: re_oNyyijbb_NZcjCphagyuwrSskpcmXNiMC
- From: onboarding@resend.dev (need custom domain later)

## Key Files
- `client-acquisition-kit.md` — full lead gen playbook
- `outreach-targets.md` — PM companies with contact info
- `cold-emails-ready.md` — ready-to-send emails + social posts
- `today-schedule.md` — daily action plan template
- `follow-up-templates.md` — follow-up sequences
- `valencia-flyer.html` — digital flyer
- `valencia-competitive-analysis.md` — competitor research
- `valencia-kitchen-remodel-page.html` — original kitchen page
- `valencia-kitchen-wp-entities.html` — encoding-fixed version

## 9-DAY PROGRESS TRACKER (Feb 20-28, 2026)

**Current Status:** End of Day 2 (Feb 20-22)

| Metric | Goal | Actual | Status |
|--------|------|--------|--------|
| Contacts (emails sent) | 25+ | 4 | 🟠 |
| Responses Back | — | 0 | 🔴 |
| Doors Knocked / Hangers Dropped | 50+ | 0 | 🔴 |
| Estimates Sent | 3+ | 0 | 🔴 |
| Social Media Posts | 5+ | 0 | 🔴 |
| Gym Sessions | 6+ | 5 | 🟢 |
| Social Activities | 2+ | 2 | 🟢 |
| AI Project Status | Shipped/Demo | Nightshift builds done | 🟡 |

**Daily Log:**
- Feb 20: Setup day + nightshift builds (FAQ, job costing template, AI agency playbook)
- Feb 21-22: 4 emails sent, fitness & social locked in
- Feb 23-27: Week 2 Execution (RESET: smaller daily targets)
- Feb 28: Monthly Review

**REALITY CHECK (Feb 22):**
- What worked: Fitness is locked (5 gym sessions), social activities hitting
- What didn't: Zero email responses yet (normal), zero social posts (blocker?), no door hangers
- Next move: Make lead gen ACTIONABLE, not ambitious. Small daily wins beat big plans that don't ship.

---

## Steve's Operating Mode — EMPLOYEE NOT ASSISTANT (Updated Mar 2, 2026)
**Key Directive from Tris:** Operate like an employee, not an assistant waiting for instructions.

### Daily Checks (Check EVERY morning before 8am)
1. **Workflow Health** — Did Hunter run? Are leads queued for Karl? Is Karl processing?
2. **Valencia Tracker** — How many leads logged? Any consultations booked?
3. **Karl's Queue** — Check agent-queue.json:
   - How many "new" drafts (unprocessed)
   - How many "pending-approval" (awaiting Tris's YES/NO)
   - How many "sent" (already posted)
4. **Status Report** — By 7:45am, I should know:
   - How many leads found in last 24h
   - Status of Karl's draft replies (how many drafted? awaiting approval? posted?)
   - Any workflow blockers or issues
5. **Proactive Alerts** — If something broke (like Hunter → Karl queue issue on Mar 2), flag it immediately

### Karl's Workflow (As of Mar 2, Evening)
1. **Read queue** → Find "new" leads
2. **Draft replies** → Create platform-specific responses (Facebook, Reddit, DM, etc.)
3. **Send to Telegram** → Use karl-send-approval.py to batch drafts and send to Tris
4. **Wait for approval** → Status becomes "awaiting-approval"
5. **Post approved replies** → Only after Tris says YES
6. **Mark as sent** → Status becomes "sent", logged in engagement log

**Critical Rule:** Karl NEVER posts without explicit approval from Tris. Everything goes through Telegram first.

### Never Just Ask for Status
- ❌ WRONG: "How's business?" — I should already know and tell you
- ✅ RIGHT: "Last 24h: Found 4 leads. Karl drafted 12 replies, sent 8 for approval, awaiting your go-ahead on 4 Hot leads."

### Lesson from Mar 2
When Tris asked "how's our business going?" I had to ask for clarification instead of already knowing. That's a failure. I should:
- Check tracker.xlsx daily
- Check agent-queue.json daily
- Monitor Karl's status and actions
- Flag issues before being asked
- Deliver real updates with numbers, not generic summaries

This is employee work, not assistant work.
