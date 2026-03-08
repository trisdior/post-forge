/**
 * PostForge Phase 2: Scheduled Content Generation Service
 * Handles recurring schedule jobs, content generation, and approval workflow
 */

class SchedulerService {
  constructor(redisConfig = {}) {
    // Use PostForge's existing redis instance
    if (redisConfig.redis) {
      this.redis = redisConfig.redis;
    } else {
      this.redis = null;
    }

    // In-memory queues (simplified for Vercel/Upstash)
    this.scheduleQueue = {
      jobs: new Map(),
      add: async function(data, options) {
        const jobId = options.jobId || `job_${Date.now()}`;
        this.jobs.set(jobId, { ...data, jobId, createdAt: Date.now() });
        return { id: jobId };
      },
      getJob: async function(jobId) {
        return this.jobs.get(jobId);
      }
    };

    this.postingQueue = {
      jobs: new Map(),
      add: async function(data, options) {
        const jobId = options.jobId || `post_${Date.now()}`;
        const delay = options.delay || 0;
        const scheduledTime = Date.now() + delay;
        this.jobs.set(jobId, { ...data, jobId, scheduledTime, createdAt: Date.now() });
        return { id: jobId };
      },
      getJob: async function(jobId) {
        return this.jobs.get(jobId);
      }
    };

    this.setupProcessors();
  }

  /**
   * Setup job processors for scheduled generation
   */
  setupProcessors() {
    // Process generation jobs (simplified for Upstash)
    const processGenerationJob = async (job) => {
      const { scheduleId, userId } = job.data;
      console.log(`[SCHEDULER] Processing schedule ${scheduleId} for user ${userId}`);

      try {
        // Fetch schedule config from DB
        const schedule = await this.getScheduleFromDB(scheduleId);

        // Generate content variants
        const variants = await generateContent({
          industry: schedule.industry,
          platforms: schedule.platforms,
          variations: schedule.variations || 3
        });

        // Score variants (higher = better)
        const scored = variants.map((variant, idx) => ({
          id: `v${idx + 1}`,
          text: variant,
          score: Math.random() * 2 + 7 // 7-9 score for now, replace with real scoring
        }));

        // Create approval in DB
        const approval = await this.createApprovalInDB({
          userId,
          scheduleId,
          variants: scored,
          expiresAt: Date.now() + (4 * 60 * 60 * 1000) // 4 hour approval window
        });

        console.log(`[SCHEDULER] Created approval ${approval.id} with ${scored.length} variants`);

        // Notify user (emit event or send notification)
        await this.notifyUser(userId, {
          type: 'approval-pending',
          approvalId: approval.id,
          scheduleId,
          expiresIn: '4 hours'
        });

        return {
          approvalId: approval.id,
          variantCount: scored.length,
          expiresAt: approval.expiresAt
        };
      } catch (error) {
        console.error(`[SCHEDULER] Error processing schedule ${scheduleId}:`, error);
        throw error;
      }
    });

    // Process posting jobs
    this.postingQueue.process(async (job) => {
      const { approvalId, userId, variant, platforms, postAt } = job.data;
      console.log(`[POSTING] Publishing approval ${approvalId} to ${platforms.join(', ')}`);

      try {
        const results = await this.publishToSocial({
          userId,
          text: variant.text,
          images: variant.images,
          platforms
        });

        // Log post success
        await this.createPostInDB({
          approvalId,
          userId,
          platforms,
          postedAt: Date.now(),
          results
        });

        // Notify user
        await this.notifyUser(userId, {
          type: 'post-published',
          results
        });

        return { postedAt: Date.now(), results };
      } catch (error) {
        console.error(`[POSTING] Error publishing approval ${approvalId}:`, error);
        await this.notifyUser(userId, {
          type: 'post-failed',
          error: error.message
        });
        throw error;
      }
    });
  }

  /**
   * Create a recurring schedule
   * @param {string} userId
   * @param {object} config - { frequency, time, platforms, industry, variations, autoApprove }
   * @returns {object} created schedule
   */
  async createSchedule(userId, config) {
    const scheduleId = `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const schedule = {
      id: scheduleId,
      userId,
      ...config,
      isActive: true,
      createdAt: Date.now(),
      nextRun: this.calculateNextRun(config.frequency, config.time)
    };

    // Save to DB (you'll implement this)
    await this.saveScheduleToDB(schedule);

    // Register with Bull queue
    const cronExpression = this.frequencyToCron(config.frequency, config.time);
    await this.scheduleQueue.add(
      { scheduleId, userId },
      {
        repeat: { cron: cronExpression },
        jobId: `job_${scheduleId}`
      }
    );

    console.log(`[SCHEDULER] Created schedule ${scheduleId} with cron: ${cronExpression}`);
    return schedule;
  }

  /**
   * Update a schedule
   */
  async updateSchedule(scheduleId, updates) {
    const schedule = await this.getScheduleFromDB(scheduleId);
    Object.assign(schedule, updates);
    await this.saveScheduleToDB(schedule);

    // If frequency changed, update cron job
    if (updates.frequency || updates.time) {
      const cronExpression = this.frequencyToCron(schedule.frequency, schedule.time);
      await this.scheduleQueue.add(
        { scheduleId: schedule.id, userId: schedule.userId },
        {
          repeat: { cron: cronExpression },
          jobId: `job_${scheduleId}`
        }
      );
    }

    return schedule;
  }

  /**
   * Pause a schedule
   */
  async pauseSchedule(scheduleId) {
    const schedule = await this.getScheduleFromDB(scheduleId);
    schedule.isActive = false;
    await this.saveScheduleToDB(schedule);

    // Remove from recurring queue
    const job = await this.scheduleQueue.getJob(`job_${scheduleId}`);
    if (job) {
      await job.remove();
    }

    return schedule;
  }

  /**
   * Resume a paused schedule
   */
  async resumeSchedule(scheduleId) {
    const schedule = await this.getScheduleFromDB(scheduleId);
    schedule.isActive = true;
    await this.saveScheduleToDB(schedule);

    // Re-add to recurring queue
    const cronExpression = this.frequencyToCron(schedule.frequency, schedule.time);
    await this.scheduleQueue.add(
      { scheduleId: schedule.id, userId: schedule.userId },
      {
        repeat: { cron: cronExpression },
        jobId: `job_${scheduleId}`
      }
    );

    return schedule;
  }

  /**
   * Delete a schedule
   */
  async deleteSchedule(scheduleId) {
    // Remove from DB
    await this.deleteScheduleFromDB(scheduleId);

    // Remove recurring job
    const job = await this.scheduleQueue.getJob(`job_${scheduleId}`);
    if (job) {
      await job.remove();
    }

    return { deleted: true, scheduleId };
  }

  /**
   * Get user's schedules
   */
  async getUserSchedules(userId) {
    return await this.getSchedulesFromDB(userId);
  }

  /**
   * Convert frequency (daily, weekly, etc) to cron expression
   */
  frequencyToCron(frequency, time) {
    const [hour, minute] = time.split(':').map(Number);

    switch (frequency) {
      case 'daily':
        return `${minute} ${hour} * * *`; // Every day at HH:MM
      case 'weekly':
        return `${minute} ${hour} * * 1`; // Every Monday at HH:MM (change 1 for other days)
      case 'monthly':
        return `${minute} ${hour} 1 * *`; // First of month at HH:MM
      default:
        return frequency; // Custom cron expression
    }
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
   * Publish content to social platforms
   */
  async publishToSocial({ userId, text, images, platforms }) {
    const results = {};

    for (const platform of platforms) {
      try {
        // TODO: Implement platform-specific publishing
        // For now, mock success
        results[platform] = {
          success: true,
          postId: `post_${Date.now()}_${platform}`,
          url: `https://${platform}.com/posts/example`
        };
      } catch (error) {
        results[platform] = { success: false, error: error.message };
      }
    }

    return results;
  }

  /**
   * Notify user of approval/post events
   */
  async notifyUser(userId, notification) {
    // TODO: Implement notification (email, push, webhook, etc)
    console.log(`[NOTIFICATION] User ${userId}:`, notification);
  }

  // ===== DB Methods (implement these with your DB) =====
  async getScheduleFromDB(scheduleId) {
    // TODO: Fetch from database
    return {};
  }

  async getSchedulesFromDB(userId) {
    // TODO: Fetch all schedules for user
    return [];
  }

  async saveScheduleToDB(schedule) {
    // TODO: Save to database
  }

  async deleteScheduleFromDB(scheduleId) {
    // TODO: Delete from database
  }

  async createApprovalInDB(approval) {
    // TODO: Create approval record
    return { id: `appr_${Date.now()}`, ...approval };
  }

  async createPostInDB(post) {
    // TODO: Create post record
    return { id: `post_${Date.now()}`, ...post };
  }
}

module.exports = SchedulerService;
