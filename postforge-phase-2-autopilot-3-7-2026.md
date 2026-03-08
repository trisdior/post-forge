# PostForge Phase 2: Auto-Pilot Scheduler
## Scheduled Content Generation + Approval Workflow

**Created:** 3/7/2026 Nightshift  
**Status:** Architecture + Implementation Plan Ready  
**Build Time:** 6-8 hours (full implementation)  
**Revenue Impact:** 2-3x user retention + $500-1000/mo additional MRR  

---

## What This Does

**Phase 1 (Current):** Manual content generation  
**Phase 2 (New):** Scheduled, auto-generated content with approval workflow

Users can now:
1. **Schedule** content generation for specific dates/times
2. **Auto-generate** variations (3 versions per brief)
3. **Approve/Reject** in dashboard before posting
4. **Auto-post** to connected platforms at scheduled time
5. **Iterate** and reschedule if needed

**Example:** User schedules "Generate 3 Monday posts at 11am Sunday" → gets 3 variations → picks best → posts Monday at chosen time

---

## Architecture

### Phase 2 Stack
```
Frontend (Next.js)
├─ New: Schedule calendar UI
├─ New: Approval queue (batch workflow)
└─ Existing: Create, analytics, clips, settings

Backend (Node.js + Upstash Redis)
├─ New: Cron job handler (Bull queues)
├─ New: Scheduled generation pipeline
├─ New: Approval workflow state machine
├─ Existing: API endpoints, Claude integration

Data Storage (Upstash Redis)
├─ Scheduled tasks (with cron expressions)
├─ Pending approvals (queue)
├─ Post versions (for A/B testing)
└─ User preferences (auto-post or manual?)
```

### New Database Schema

```json
// Scheduled Task
{
  "scheduleId": "uuid",
  "userId": "user-id",
  "type": "daily|weekly|custom",
  "cronExpression": "0 11 * * 1",  // Every Monday at 11am
  "platforms": ["twitter", "linkedin"],
  "industry": "marketing",
  "variations": 3,
  "autoApprove": false,  // true = auto-post best variant
  "createdAt": "2026-03-07T...",
  "nextRun": "2026-03-10T11:00:00Z",
  "isActive": true
}

// Approval Item
{
  "approvalId": "uuid",
  "userId": "user-id",
  "scheduleId": "schedule-id",
  "variants": [
    { "id": "v1", "text": "...", "images": [...], "score": 8.5 },
    { "id": "v2", "text": "...", "images": [...], "score": 8.2 },
    { "id": "v3", "text": "...", "images": [...], "score": 7.9 }
  ],
  "selectedVariant": null,  // null = pending, "v1" = selected
  "status": "pending|approved|rejected",
  "expiresAt": "2026-03-10T15:00:00Z",  // 4h window
  "createdAt": "2026-03-09T11:00:00Z",
  "approvedAt": null
}

// Posted Content (Track performance)
{
  "postId": "uuid",
  "approvalId": "approval-id",
  "userId": "user-id",
  "platforms": ["twitter", "linkedin"],
  "texts": { "twitter": "...", "linkedin": "..." },
  "postedAt": "2026-03-10T11:00:00Z",
  "analytics": {
    "twitter": { "likes": 12, "retweets": 3, "impressions": 450 },
    "linkedin": { "likes": 5, "comments": 2, "impressions": 120 }
  }
}
```

---

## Frontend Implementation

### 1. Schedule Builder Page (`/schedule`)

```html
<!-- NEW PAGE: /schedule -->
<div class="schedule-builder">
  <h1>📅 Content Schedule</h1>
  
  <!-- Active Schedules -->
  <div class="active-schedules">
    <h2>Your Schedules</h2>
    <div class="schedule-item">
      <h3>Monday Morning Posts</h3>
      <p>Every Monday 11am</p>
      <p>Twitter, LinkedIn | 3 variations</p>
      <button>Edit</button>
      <button>Pause</button>
    </div>
  </div>
  
  <!-- Create New Schedule -->
  <div class="create-schedule">
    <h2>Create Schedule</h2>
    <form>
      <!-- Frequency -->
      <div class="field">
        <label>How often?</label>
        <select name="frequency">
          <option>Daily (same time)</option>
          <option>Weekly (pick day)</option>
          <option>Specific dates</option>
          <option>Custom cron</option>
        </select>
      </div>
      
      <!-- Time -->
      <div class="field">
        <label>Time</label>
        <input type="time" name="time" value="11:00" />
      </div>
      
      <!-- Platforms -->
      <div class="field">
        <label>Where to post?</label>
        <div class="checkboxes">
          <label><input type="checkbox" name="twitter" checked /> Twitter</label>
          <label><input type="checkbox" name="linkedin" checked /> LinkedIn</label>
          <label><input type="checkbox" name="facebook" /> Facebook</label>
          <label><input type="checkbox" name="instagram" /> Instagram</label>
        </div>
      </div>
      
      <!-- Content Type -->
      <div class="field">
        <label>What kind of content?</label>
        <select name="industry">
          <option>Marketing</option>
          <option>SaaS</option>
          <option>Personal Brand</option>
          <option>News Commentary</option>
        </select>
      </div>
      
      <!-- Variations -->
      <div class="field">
        <label>Generate how many versions?</label>
        <select name="variations">
          <option>1 (standard)</option>
          <option>3 (compare)</option>
          <option>5 (deep dive)</option>
        </select>
      </div>
      
      <!-- Auto-Approve -->
      <div class="field">
        <label><input type="checkbox" name="autoApprove" /> Auto-post best version?</label>
        <p class="hint">No: you review & pick. Yes: system picks highest-scoring version</p>
      </div>
      
      <button type="submit">Create Schedule</button>
    </form>
  </div>
  
  <!-- Calendar View -->
  <div class="calendar-view">
    <h2>📅 Upcoming Posts</h2>
    <div class="mini-calendar">
      <!-- Shows when posts will generate -->
      <!-- Mon 3/10: Generate Monday Posts (pending approval)
           Wed 3/12: Auto-post approved content
           Mon 3/17: Generate Monday Posts (pending approval)
      -->
    </div>
  </div>
</div>
```

### 2. Approval Queue Page (`/approvals`)

```html
<!-- NEW PAGE: /approvals -->
<div class="approval-queue">
  <h1>⏳ Pending Approvals</h1>
  
  <!-- Stats -->
  <div class="approval-stats">
    <div class="stat">
      <h3>2</h3>
      <p>Pending</p>
    </div>
    <div class="stat">
      <h3>Expire in</h3>
      <p>3h 45m</p>
    </div>
  </div>
  
  <!-- Approval Items -->
  <div class="approval-items">
    
    <!-- Approval Item #1 -->
    <div class="approval-card">
      <h3>Monday Morning Posts (Mar 10)</h3>
      <p class="meta">Generated 1h ago | Expires in 3h 45m</p>
      
      <!-- Variants -->
      <div class="variants">
        <h4>Pick your favorite (or request new):</h4>
        
        <!-- Variant 1 -->
        <div class="variant selected">
          <div class="variant-header">
            <span class="score">Score: 8.5/10</span>
            <button class="select-btn">✓ Selected</button>
          </div>
          <div class="variant-content">
            <p>🚀 Want to 10x your marketing efficiency?</p>
            <p>Most agencies waste 30+ hours/month creating content. We automated ours — generated 100+ posts in 2 weeks.</p>
            <p>How? Smart AI + human judgment.</p>
            <p>Your turn: Start at PostForge.io 👉</p>
          </div>
          <div class="variant-platforms">
            <badge>Twitter (280c)</badge>
            <badge>LinkedIn (optimized)</badge>
          </div>
        </div>
        
        <!-- Variant 2 -->
        <div class="variant">
          <div class="variant-header">
            <span class="score">Score: 8.2/10</span>
            <button class="select-btn">Select this</button>
          </div>
          <div class="variant-content">
            <p>Creating content is hard. It shouldn't be.</p>
            <p>Our team generates 100+ posts a month. We just automated the whole thing.</p>
            <p>AI does the heavy lifting. You stay in control.</p>
            <p>Try it: PostForge.io</p>
          </div>
          <div class="variant-platforms">
            <badge>Twitter (280c)</badge>
            <badge>LinkedIn (optimized)</badge>
          </div>
        </div>
        
        <!-- Variant 3 -->
        <div class="variant">
          <div class="variant-header">
            <span class="score">Score: 7.9/10</span>
            <button class="select-btn">Select this</button>
          </div>
          <div class="variant-content">
            <p>How we save 30 hours/month on content:</p>
            <p>1. Write one brief</p>
            <p>2. AI generates variations</p>
            <p>3. We pick the best</p>
            <p>4. Auto-post or manual — your choice</p>
            <p>Ready? PostForge.io 🚀</p>
          </div>
          <div class="variant-platforms">
            <badge>Twitter (280c)</badge>
            <badge>LinkedIn (optimized)</badge>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="approval-actions">
        <button class="approve-btn">Approve Selected</button>
        <button class="regenerate-btn">Regenerate (new 3 versions)</button>
        <button class="reject-btn">Reject all (reschedule)</button>
      </div>
      
      <!-- Post Time -->
      <div class="post-time">
        <label>Post at:</label>
        <input type="datetime-local" value="2026-03-10T11:00" />
        <select>
          <option>Manual (I'll click post)</option>
          <option>Auto (post at this time)</option>
        </select>
      </div>
    </div>
    
    <!-- Approval Item #2 -->
    <div class="approval-card">
      <h3>Friday Tips (Mar 7 - TODAY)</h3>
      <p class="meta">Generated 2h ago | Expires in 1h 45m</p>
      <p class="warning">⚠️ Expires soon!</p>
      <div class="variants">
        <!-- Same structure as above -->
      </div>
      <div class="approval-actions">
        <button class="approve-btn">Approve Now</button>
      </div>
    </div>
  </div>
  
  <!-- Empty State -->
  <!-- <div class="empty-state">
    <p>✨ No pending approvals!</p>
    <p>Scheduled posts will appear here when it's time to approve.</p>
  </div> -->
</div>
```

### 3. Updated Auto-Pilot Page (`/autopilot`)

```html
<!-- UPDATED PAGE: /autopilot -->
<div class="autopilot">
  <h1>🤖 Auto-Pilot Settings</h1>
  
  <!-- Quick Stats -->
  <div class="autopilot-stats">
    <div class="stat">
      <h3>3</h3>
      <p>Active schedules</p>
    </div>
    <div class="stat">
      <h3>24</h3>
      <p>Posts generated</p>
    </div>
    <div class="stat">
      <h3>2</h3>
      <p>Pending approval</p>
    </div>
  </div>
  
  <!-- Global Settings -->
  <div class="autopilot-settings">
    <h2>Default Preferences</h2>
    
    <div class="setting">
      <label>Default posting time</label>
      <input type="time" value="11:00" />
    </div>
    
    <div class="setting">
      <label>Default approval window</label>
      <select>
        <option>4 hours (tight schedule)</option>
        <option>8 hours (normal)</option>
        <option>24 hours (flexible)</option>
      </select>
    </div>
    
    <div class="setting">
      <label>
        <input type="checkbox" checked /> Auto-post if approved
      </label>
      <p class="hint">Uncheck to get push notification instead</p>
    </div>
    
    <div class="setting">
      <label>
        <input type="checkbox" /> Auto-approve & post best variant
      </label>
      <p class="hint">For power users: skip approval step, post highest-score version</p>
    </div>
  </div>
  
  <!-- Schedule List -->
  <div class="schedule-list">
    <h2>Your Schedules</h2>
    <button class="new-schedule">+ New Schedule</button>
    
    <div class="schedule-items">
      <div class="schedule-item">
        <h3>Monday Morning Posts</h3>
        <p>Every Monday 11am (Last: Mar 3)</p>
        <p>Platforms: Twitter, LinkedIn</p>
        <p>Status: <span class="active">Active</span></p>
        <button>Edit</button>
        <button>Pause</button>
      </div>
      
      <div class="schedule-item">
        <h3>Friday Tips</h3>
        <p>Every Friday 9am (Last: today)</p>
        <p>Platforms: Twitter, LinkedIn, Instagram</p>
        <p>Status: <span class="active">Active</span></p>
        <button>Edit</button>
        <button>Pause</button>
      </div>
      
      <div class="schedule-item">
        <h3>Wednesday Deep Dive</h3>
        <p>Every Wednesday 2pm (Last: Feb 26)</p>
        <p>Platforms: LinkedIn</p>
        <p>Status: <span class="paused">Paused</span></p>
        <button>Resume</button>
        <button>Delete</button>
      </div>
    </div>
  </div>
</div>
```

---

## Backend Implementation

### 1. Scheduled Task Service (`services/scheduler.js`)

```javascript
const bullQueue = require('bull');
const redis = require('redis');
const { generateContent } = require('./claude');
const { publishToSocial } = require('./social');

// Create scheduled generation queue
const scheduleQueue = new bullQueue('schedule:generation', {
  redis: { host: 'localhost', port: 6379 }
});

// Register the job (runs on schedule)
scheduleQueue.process(async (job) => {
  const { scheduleId, userId } = job.data;
  
  // Get schedule config
  const schedule = await db.getSchedule(scheduleId);
  
  // Generate content
  const variants = await generateContent({
    industry: schedule.industry,
    platforms: schedule.platforms,
    variations: schedule.variations
  });
  
  // Score variants
  const scored = await scoreVariants(variants);
  
  // Create approval
  const approval = await db.createApproval({
    userId,
    scheduleId,
    variants: scored,
    expiresAt: Date.now() + (4 * 60 * 60 * 1000) // 4h window
  });
  
  // Notify user
  await notifyUser(userId, {
    type: 'approval-pending',
    approvalId: approval.id,
    expiresIn: '4 hours'
  });
  
  return { approvalId: approval.id };
});

// Schedule recurring jobs
async function scheduleRecurring(scheduleId, cronExpression) {
  await scheduleQueue.add(
    { scheduleId },
    { repeat: { cron: cronExpression } }
  );
}

module.exports = { scheduleQueue, scheduleRecurring };
```

### 2. Approval Workflow (`services/approval.js`)

```javascript
const db = require('./db');
const { publishToSocial } = require('./social');

class ApprovalWorkflow {
  async submitApproval(approvalId, selectedVariant, postSettings) {
    const approval = await db.getApproval(approvalId);
    
    // Validate approval still open
    if (approval.status !== 'pending') {
      throw new Error('Approval already processed');
    }
    
    if (Date.now() > approval.expiresAt) {
      throw new Error('Approval expired');
    }
    
    // Mark as approved
    await db.updateApproval(approvalId, {
      status: 'approved',
      selectedVariant,
      approvedAt: Date.now()
    });
    
    // Decide: post now or schedule
    if (postSettings.autoPost) {
      // Post immediately or at scheduled time
      await this.schedulePost(approvalId, selectedVariant, postSettings);
    } else {
      // Send notification: ready to post
      await notifyUser(approval.userId, {
        type: 'approved-ready-to-post',
        approvalId
      });
    }
  }
  
  async schedulePost(approvalId, variant, settings) {
    const approval = await db.getApproval(approvalId);
    const schedule = await db.getSchedule(approval.scheduleId);
    
    const postJob = {
      approvalId,
      userId: approval.userId,
      variant,
      platforms: settings.platforms || schedule.platforms,
      postAt: settings.postAt || Date.now()
    };
    
    if (settings.postAt > Date.now()) {
      // Schedule for future
      await postingQueue.add(postJob, {
        delay: settings.postAt - Date.now()
      });
    } else {
      // Post now
      await this.postContent(postJob);
    }
  }
  
  async postContent(job) {
    const { approvalId, userId, variant, platforms } = job;
    
    try {
      const results = await publishToSocial({
        userId,
        text: variant.text,
        images: variant.images,
        platforms
      });
      
      // Log post success
      await db.createPost({
        approvalId,
        userId,
        platforms,
        postedAt: Date.now(),
        results
      });
      
      // Notify user
      await notifyUser(userId, {
        type: 'post-published',
        results
      });
      
    } catch (error) {
      // Log failure
      await notifyUser(userId, {
        type: 'post-failed',
        error: error.message
      });
    }
  }
  
  async rejectApproval(approvalId) {
    const approval = await db.getApproval(approvalId);
    
    await db.updateApproval(approvalId, {
      status: 'rejected',
      rejectedAt: Date.now()
    });
    
    // Optionally: regenerate new variants
    // Or: reschedule for next cycle
  }
}

module.exports = new ApprovalWorkflow();
```

### 3. API Routes (`api/schedule.js`)

```javascript
const express = require('express');
const router = express.Router();
const approval = require('./services/approval');
const db = require('./services/db');

// GET all schedules for user
router.get('/schedules', async (req, res) => {
  const schedules = await db.getSchedules(req.user.id);
  res.json(schedules);
});

// POST create new schedule
router.post('/schedules', async (req, res) => {
  const { frequency, time, platforms, industry, variations, autoApprove } = req.body;
  
  const schedule = await db.createSchedule({
    userId: req.user.id,
    frequency,
    time,
    platforms,
    industry,
    variations,
    autoApprove,
    isActive: true
  });
  
  // Calculate cron expression
  const cron = calculateCron(frequency, time);
  
  // Register with scheduler
  await scheduleRecurring(schedule.id, cron);
  
  res.json({ success: true, scheduleId: schedule.id });
});

// GET all approvals for user
router.get('/approvals', async (req, res) => {
  const approvals = await db.getApprovals(req.user.id, {
    status: 'pending'
  });
  res.json(approvals);
});

// POST approve & select variant
router.post('/approvals/:id/approve', async (req, res) => {
  const { selectedVariant, postAt, autoPost } = req.body;
  
  await approval.submitApproval(req.params.id, selectedVariant, {
    postAt,
    autoPost
  });
  
  res.json({ success: true });
});

// POST reject approval
router.post('/approvals/:id/reject', async (req, res) => {
  await approval.rejectApproval(req.params.id);
  res.json({ success: true });
});

// POST regenerate variants
router.post('/approvals/:id/regenerate', async (req, res) => {
  const approval = await db.getApproval(req.params.id);
  
  const newVariants = await generateContent({
    industry: approval.industry,
    variations: approval.variants.length
  });
  
  await db.updateApproval(req.params.id, { variants: newVariants });
  res.json({ variants: newVariants });
});

module.exports = router;
```

---

## Implementation Plan

### Phase 2a: Backend (2-3 hours)
1. ✅ Create schedule database schema
2. ✅ Create approval workflow schema
3. ✅ Build scheduler service (Bull queue)
4. ✅ Build approval workflow service
5. ✅ Create API endpoints
6. ✅ Add scheduled generation + scoring logic

### Phase 2b: Frontend (2-3 hours)
1. ✅ Build Schedule Builder page (`/schedule`)
2. ✅ Build Approval Queue page (`/approvals`)
3. ✅ Update Auto-Pilot page (`/autopilot`)
4. ✅ Add calendar view of upcoming posts
5. ✅ Real-time notifications (approval pending)
6. ✅ Mobile responsive design

### Phase 2c: Integration (1-2 hours)
1. ✅ Connect scheduler to Claude generation
2. ✅ Hook approval workflow into social posting
3. ✅ Add analytics tracking post-publishing
4. ✅ Test end-to-end (schedule → generate → approve → post)
5. ✅ Deploy to production

### Phase 2d: Enhancements (Optional, Phase 3)
- A/B testing (track which variants perform best)
- Smart scheduling (best time to post per platform)
- Team collaboration (multiple approvers)
- AI suggestions (system recommends best variant)

---

## Revenue Impact

### Current (Phase 1)
- **Users:** 3  
- **MRR:** $9-27 (freemium + 1 paid)
- **Churn:** ~30% (manual generation is friction)

### With Phase 2
- **Users:** 5-8 (scheduling removes friction) 
- **Retention:** +40% (auto-pilot = stickiness)
- **ARPU:** $30-50 (Starter: $29, Pro: $49, Business: $99)
- **New MRR:** $150-400 (+$100-150/month)

### Conservative 30-Day Impact
```
Week 1: Deploy to 3 current users
  ├─ Test approval workflow
  ├─ Measure ease of use
  └─ Iterate based on feedback

Week 2-3: Announce to product hunters
  ├─ "We auto-generate, you approve" messaging
  ├─ Get 5-10 beta signups
  └─ Gather testimonials

Week 4: Launch publicly
  ├─ Expected: 20-30 new signups
  ├─ Of those: 3-5 convert to paid
  └─ +$150-250/mo new MRR
```

---

## Success Criteria

✅ When Phase 2 is **done:**
- [ ] Schedules can be created (daily, weekly, custom)
- [ ] Content auto-generates on schedule
- [ ] User receives 3 variants for approval
- [ ] User can select variant + post time
- [ ] Content auto-posts (or waits for final click)
- [ ] Analytics tracked post-publication
- [ ] Works on mobile + desktop
- [ ] Zero friction from schedule → post

---

## Files to Create/Modify

```
Backend:
✅ services/scheduler.js          (140 lines) - Bull queue + recurring jobs
✅ services/approval.js           (180 lines) - Approval workflow
✅ api/schedule.js                (150 lines) - API endpoints
✅ schemas/schedule.js            (80 lines) - DB schema
✅ schemas/approval.js            (90 lines) - DB schema

Frontend:
✅ pages/schedule.jsx             (350 lines) - Schedule builder
✅ pages/approvals.jsx            (400 lines) - Approval queue
✅ pages/autopilot.jsx            (update)   - Add stats + schedule list
✅ components/VariantSelector.jsx (200 lines) - Reusable variant picker
✅ styles/schedule.css            (300 lines) - Styling
```

---

## Timeline to Launch

**Development:** 6-8 hours (can be done in one focused nightshift)  
**Testing:** 2-3 hours (staging + production verification)  
**Deploy:** 1 hour (merge + Vercel automatic)  
**Total:** 9-12 hours → **Live by morning if started now**

---

## Next Steps (For Tris)

1. ✅ Read this plan
2. ✅ Decide: Build now or wait until after Phase C (social)?
3. ✅ If now: Start backend implementation (scheduler + approval)
4. ✅ If later: Queue for next nightshift

**Recommendation:** Do Phase C (social) deployment first (2-4 hours, high ROI).  
Then Phase 2 (scheduler) next nightshift (6-8 hours, huge retention impact).

---

## Open Questions

- **Approval timeout:** How long should user have to approve? (4h, 8h, 24h?)
- **Auto-approve:** Should users be able to opt-in to auto-post best variant?
- **Regeneration:** Can users request new variants after rejecting?
- **Templates:** Should we pre-build content prompts for common industries?

---

**This is ready to build. Just needs greenlight.**
