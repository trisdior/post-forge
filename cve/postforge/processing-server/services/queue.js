/**
 * Job Queue Service
 * Manages processing jobs with max 3 concurrent, timeouts, and queueing
 */

const { v4: uuidv4 } = require('uuid');
const { getTier } = require('../config/tiers');

class JobQueue {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
    this.activeJobs = new Map(); // Currently processing
    this.queuedJobs = []; // Waiting to process
    this.completedJobs = new Map();
    this.jobTimeouts = new Map(); // Track timeouts per job
    this.MAX_JOB_DURATION_MS = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Add a job to the queue
   * @param {object} job - Job definition
   * @param {string} job.type - 'transcribe', 'analyze', 'cut', etc.
   * @param {string} job.userId - User ID
   * @param {string} job.userTier - User tier (free, growth, pro, business)
   * @param {string} job.videoId - Video ID
   * @param {object} job.payload - Job-specific data
   * @param {function} job.execute - Function that executes the job
   * @returns {object} Job info with jobId and queue position
   */
  enqueue(job) {
    const jobId = uuidv4();
    const tier = getTier(job.userTier);

    const queuedJob = {
      jobId,
      ...job,
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
      status: 'queued',
      priority: tier.queuePriority || 'low',
      estimatedWaitTime: this.estimateWaitTime()
    };

    // Check if we can start immediately
    if (this.activeJobs.size < this.maxConcurrent) {
      this.startJob(queuedJob);
    } else {
      // Add to queue, sorted by priority
      this.queuedJobs.push(queuedJob);
      this.queuedJobs.sort((a, b) => {
        const priorityMap = { critical: 4, high: 3, medium: 2, low: 1 };
        return (priorityMap[b.priority] || 1) - (priorityMap[a.priority] || 1);
      });
    }

    return {
      jobId,
      status: queuedJob.status,
      position: this.queuedJobs.indexOf(queuedJob) + 1,
      estimatedWaitTime: queuedJob.estimatedWaitTime,
      message: queuedJob.status === 'queued'
        ? `Server busy. Your clip is queued (#${this.queuedJobs.indexOf(queuedJob) + 1} in line). Processing starts in ~${queuedJob.estimatedWaitTime} min.`
        : 'Processing started'
    };
  }

  /**
   * Start processing a job
   * @private
   */
  async startJob(job) {
    job.status = 'processing';
    job.startedAt = Date.now();

    // Set job timeout
    const timeout = setTimeout(() => {
      this.timeoutJob(job.jobId);
    }, this.MAX_JOB_DURATION_MS);

    this.jobTimeouts.set(job.jobId, timeout);
    this.activeJobs.set(job.jobId, job);

    // Remove from queue if it was there
    const queueIndex = this.queuedJobs.findIndex(j => j.jobId === job.jobId);
    if (queueIndex >= 0) {
      this.queuedJobs.splice(queueIndex, 1);
    }

    console.log(`[Queue] Starting job ${job.jobId} (type: ${job.type}, user: ${job.userId})`);

    try {
      // Execute the job
      const result = await job.execute();

      // Mark as completed
      job.status = 'completed';
      job.completedAt = Date.now();
      job.result = result;

      // Clean up timeout
      clearTimeout(this.jobTimeouts.get(job.jobId));
      this.jobTimeouts.delete(job.jobId);
      this.activeJobs.delete(job.jobId);

      // Store in completed history
      this.completedJobs.set(job.jobId, job);

      console.log(`[Queue] Job ${job.jobId} completed in ${job.completedAt - job.startedAt}ms`);

      // Process next queued job
      this.processNextQueued();

      return { success: true, jobId: job.jobId, result };
    } catch (error) {
      // Mark as failed
      job.status = 'failed';
      job.completedAt = Date.now();
      job.error = error.message;

      // Clean up
      clearTimeout(this.jobTimeouts.get(job.jobId));
      this.jobTimeouts.delete(job.jobId);
      this.activeJobs.delete(job.jobId);

      // Store in completed history
      this.completedJobs.set(job.jobId, job);

      console.error(`[Queue] Job ${job.jobId} failed:`, error.message);

      // Process next queued job
      this.processNextQueued();

      throw error;
    }
  }

  /**
   * Timeout a job
   * @private
   */
  timeoutJob(jobId) {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    job.status = 'timeout';
    job.completedAt = Date.now();
    job.error = `Processing exceeded maximum duration of ${this.MAX_JOB_DURATION_MS / 60000} minutes`;

    this.activeJobs.delete(jobId);
    this.jobTimeouts.delete(jobId);
    this.completedJobs.set(jobId, job);

    console.warn(`[Queue] Job ${jobId} timed out after ${this.MAX_JOB_DURATION_MS / 60000} minutes`);

    // Process next queued job
    this.processNextQueued();
  }

  /**
   * Process next job in queue
   * @private
   */
  processNextQueued() {
    if (this.queuedJobs.length > 0 && this.activeJobs.size < this.maxConcurrent) {
      const nextJob = this.queuedJobs.shift();
      this.startJob(nextJob);
    }
  }

  /**
   * Get job status
   * @param {string} jobId
   * @returns {object} Job status
   */
  getJobStatus(jobId) {
    const active = this.activeJobs.get(jobId);
    if (active) {
      return {
        jobId,
        status: active.status,
        progress: Math.round((Date.now() - active.startedAt) / this.MAX_JOB_DURATION_MS * 100),
        elapsedSeconds: Math.round((Date.now() - active.startedAt) / 1000)
      };
    }

    const completed = this.completedJobs.get(jobId);
    if (completed) {
      return {
        jobId,
        status: completed.status,
        result: completed.result,
        error: completed.error,
        durationSeconds: Math.round((completed.completedAt - completed.startedAt) / 1000)
      };
    }

    // Check queued
    const queued = this.queuedJobs.find(j => j.jobId === jobId);
    if (queued) {
      const position = this.queuedJobs.indexOf(queued) + 1;
      return {
        jobId,
        status: 'queued',
        position,
        estimatedWaitSeconds: this.estimateWaitTime() * 60
      };
    }

    return {
      jobId,
      status: 'not_found'
    };
  }

  /**
   * Estimate wait time in minutes based on current queue
   * @private
   */
  estimateWaitTime() {
    // Assume ~2 minutes per job (conservative estimate)
    const avgJobTime = 2;
    return Math.max(1, Math.ceil(this.activeJobs.size * avgJobTime));
  }

  /**
   * Get queue stats (for monitoring)
   * @returns {object} Queue statistics
   */
  getStats() {
    return {
      activeJobs: this.activeJobs.size,
      maxConcurrent: this.maxConcurrent,
      queuedJobs: this.queuedJobs.length,
      totalQueued: this.activeJobs.size + this.queuedJobs.length,
      completedJobs: this.completedJobs.size,
      avgJobTime: this.getAverageJobTime(),
      timeoutJobs: Array.from(this.activeJobs.values()).filter(j => 
        Date.now() - j.startedAt > this.MAX_JOB_DURATION_MS * 0.9
      ).length,
      queuedByPriority: this.getQueuedByPriority()
    };
  }

  /**
   * Get queued jobs by priority
   * @private
   */
  getQueuedByPriority() {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    this.queuedJobs.forEach(job => {
      counts[job.priority || 'low']++;
    });
    return counts;
  }

  /**
   * Get average job time in seconds
   * @private
   */
  getAverageJobTime() {
    if (this.completedJobs.size === 0) return 0;

    let total = 0;
    let count = 0;

    this.completedJobs.forEach(job => {
      if (job.startedAt && job.completedAt) {
        total += job.completedAt - job.startedAt;
        count++;
      }
    });

    return count > 0 ? Math.round(total / count / 1000) : 0;
  }

  /**
   * Get top users by job count
   * @param {number} limit
   * @returns {array} Top users
   */
  getTopUsers(limit = 10) {
    const userJobCounts = {};

    // Count jobs by user
    this.completedJobs.forEach(job => {
      if (job.userId) {
        userJobCounts[job.userId] = (userJobCounts[job.userId] || 0) + 1;
      }
    });

    this.activeJobs.forEach(job => {
      if (job.userId) {
        userJobCounts[job.userId] = (userJobCounts[job.userId] || 0) + 1;
      }
    });

    this.queuedJobs.forEach(job => {
      if (job.userId) {
        userJobCounts[job.userId] = (userJobCounts[job.userId] || 0) + 1;
      }
    });

    // Sort and return top N
    return Object.entries(userJobCounts)
      .map(([userId, count]) => ({ userId, jobCount: count }))
      .sort((a, b) => b.jobCount - a.jobCount)
      .slice(0, limit);
  }

  /**
   * Clear completed jobs older than X hours (cleanup)
   * @param {number} maxAgeHours
   */
  clearOldCompleted(maxAgeHours = 24) {
    const now = Date.now();
    const maxAge = maxAgeHours * 3600 * 1000;
    let cleared = 0;

    for (const [jobId, job] of this.completedJobs) {
      if (now - job.completedAt > maxAge) {
        this.completedJobs.delete(jobId);
        cleared++;
      }
    }

    return cleared;
  }
}

// Global queue instance
const queue = new JobQueue(3); // Max 3 concurrent jobs

module.exports = {
  queue,
  JobQueue
};
