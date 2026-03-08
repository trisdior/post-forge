/**
 * Phase 2 Initialization
 * Sets up scheduler and approval services for PostForge
 */

const SchedulerService = require('./scheduler');
const ApprovalWorkflow = require('./approval');
const Phase2DB = require('./phase2-db');

async function initializePhase2(app, redis) {
  try {
    // Create database adapter
    const db = new Phase2DB(redis);

    // Initialize services
    const scheduler = new SchedulerService({
      host: 'upstash', // Signal to use Upstash config
      redis: redis
    });
    
    const approval = new ApprovalWorkflow(db, scheduler.postingQueue);

    // Setup API routes
    const setupScheduleRoutes = require('../api/schedule');
    const router = setupScheduleRoutes(db, scheduler, approval);
    app.use('/api/phase2', router);

    console.log('[Phase 2] ✅ Scheduler + Approval services initialized');
    console.log('[Phase 2] ✅ API routes mounted at /api/phase2');

    // Setup maintenance task (run hourly)
    setInterval(async () => {
      try {
        await approval.expirePendingApprovals();
      } catch (e) {
        console.error('[Phase 2] Maintenance error:', e.message);
      }
    }, 60 * 60 * 1000); // Every hour

    console.log('[Phase 2] ✅ Maintenance tasks scheduled');

    return { scheduler, approval, db };
  } catch (error) {
    console.error('[Phase 2] Initialization failed:', error.message);
    console.error(error);
    throw error;
  }
}

module.exports = initializePhase2;
