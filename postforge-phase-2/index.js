/**
 * PostForge Phase 2: Main Integration Entry Point
 * 
 * Usage:
 * const Phase2 = require('./index.js');
 * const phase2 = new Phase2(db, redisConfig);
 */

const SchedulerService = require('./services/scheduler');
const ApprovalWorkflow = require('./services/approval');
const scheduleAPI = require('./api/schedule');

class PostForgePhase2 {
  constructor(db, redisConfig = {}) {
    this.db = db;
    this.redisConfig = redisConfig;

    // Initialize services
    this.scheduler = new SchedulerService(redisConfig);
    this.approval = new ApprovalWorkflow(db, this.scheduler.postingQueue);

    console.log('[PostForge Phase 2] Services initialized');
  }

  /**
   * Get Express router for API
   * Usage: app.use('/api', phase2.getRouter())
   */
  getRouter() {
    return scheduleAPI(this.db, this.scheduler, this.approval);
  }

  /**
   * Start the scheduler (must be called on app startup)
   */
  async start() {
    console.log('[PostForge Phase 2] Starting scheduler services...');
    
    // Run any pending maintenance tasks
    await this.approval.expirePendingApprovals();
    
    // Scheduler is already running in background via Bull
    console.log('[PostForge Phase 2] ✅ Scheduler is live');
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('[PostForge Phase 2] Shutting down...');
    await this.scheduler.scheduleQueue.close();
    await this.scheduler.postingQueue.close();
    console.log('[PostForge Phase 2] ✅ Shutdown complete');
  }

  // Expose services for direct access
  getScheduler() {
    return this.scheduler;
  }

  getApprovalWorkflow() {
    return this.approval;
  }
}

module.exports = PostForgePhase2;
