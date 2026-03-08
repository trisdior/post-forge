/**
 * Phase 2 Scheduler (PostForge Edition)
 * Lightweight scheduling optimized for Vercel + Upstash
 */

const https = require('https');
const { v4: uuidv4 } = require('crypto').randomUUID ? function() { return require('crypto').randomUUID(); } : require('uuid').v4;

class Phase2Scheduler {
  constructor(db, anthropicKey) {
    this.db = db;
    this.anthropicKey = anthropicKey;
    this.activeSchedules = new Map();
  }

  /**
   * Create a new schedule
   */
  async createSchedule(userId, config) {
    const scheduleId = `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const schedule = {
      id: scheduleId,
      userId,
      frequency: config.frequency,
      time: config.time,
      platforms: config.platforms,
      industry: config.industry,
      variations: config.variations || 3,
      autoApprove: config.autoApprove || false,
      isActive: true,
      createdAt: Date.now(),
      nextRun: this.calculateNextRun(config.frequency, config.time)
    };

    await this.db.createSchedule(schedule);
    console.log(`[Phase 2] Created schedule ${scheduleId}`);

    return schedule;
  }

  /**
   * Calculate next run time
   */
  calculateNextRun(frequency, time) {
    const now = new Date();
    const [hour, minute] = time.split(':').map(Number);
    
    const next = new Date(now);
    next.setHours(hour, minute, 0, 0);

    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next.getTime();
  }

  /**
   * Check and run schedules (call this periodically)
   */
  async checkAndRunSchedules() {
    try {
      const now = Date.now();
      const schedules = await this.db.getAllSchedules ? 
        await this.db.getAllSchedules() : 
        [];

      for (const schedule of schedules) {
        if (!schedule.isActive) continue;
        if (!schedule.nextRun || schedule.nextRun > now) continue;

        console.log(`[Phase 2] Triggering schedule ${schedule.id}`);
        
        try {
          await this.generateAndApprove(schedule);
        } catch (e) {
          console.error(`[Phase 2] Error processing schedule ${schedule.id}:`, e.message);
        }

        // Update next run time
        await this.db.updateSchedule(schedule.id, {
          nextRun: this.calculateNextRun(schedule.frequency, schedule.time)
        });
      }
    } catch (e) {
      console.error('[Phase 2] Schedule check failed:', e.message);
    }
  }

  /**
   * Generate content and create approval
   */
  async generateAndApprove(schedule) {
    // Generate content variants
    const variants = await this.generateContent(schedule);

    // Create approval
    const approvalId = `appr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const approval = {
      id: approvalId,
      userId: schedule.userId,
      scheduleId: schedule.id,
      variants: variants.map((text, idx) => ({
        id: `v${idx + 1}`,
        text,
        score: 8 + Math.random() * 2 // 8-10
      })),
      selectedVariant: null,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + (4 * 60 * 60 * 1000) // 4 hours
    };

    await this.db.createApproval(approval);
    console.log(`[Phase 2] Created approval ${approvalId} for schedule ${schedule.id}`);

    return approval;
  }

  /**
   * Generate content with Claude
   */
  async generateContent(schedule) {
    const prompt = `Generate ${schedule.variations} short, engaging social media posts for a ${schedule.industry} business. 
Each post should be platform-agnostic and suitable for ${schedule.platforms.join(', ')}.
Make them unique, actionable, and conversation-starting.
Output exactly ${schedule.variations} posts, separated by "---"`;

    const content = await this.callClaude(prompt);
    const posts = content.split('---').map(p => p.trim()).filter(p => p);
    
    return posts.slice(0, schedule.variations);
  }

  /**
   * Call Claude API
   */
  callClaude(prompt) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      });

      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.anthropicKey,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.content && data.content[0]) {
              resolve(data.content[0].text);
            } else {
              reject(new Error('Invalid Claude response'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
      req.write(postData);
      req.end();
    });
  }

  /**
   * Pause schedule
   */
  async pauseSchedule(scheduleId) {
    await this.db.updateSchedule(scheduleId, { isActive: false });
    console.log(`[Phase 2] Paused schedule ${scheduleId}`);
  }

  /**
   * Resume schedule
   */
  async resumeSchedule(scheduleId) {
    const schedule = await this.db.getSchedule(scheduleId);
    await this.db.updateSchedule(scheduleId, {
      isActive: true,
      nextRun: this.calculateNextRun(schedule.frequency, schedule.time)
    });
    console.log(`[Phase 2] Resumed schedule ${scheduleId}`);
  }

  /**
   * Delete schedule
   */
  async deleteSchedule(scheduleId) {
    await this.db.deleteSchedule(scheduleId);
    console.log(`[Phase 2] Deleted schedule ${scheduleId}`);
  }
}

module.exports = Phase2Scheduler;
