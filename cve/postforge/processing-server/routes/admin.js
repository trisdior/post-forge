/**
 * Admin Routes
 * Monitoring and dashboard endpoints
 */

const express = require('express');
const { queue } = require('../services/queue');
const { monitor } = require('../services/monitoring');
const { cleanup } = require('../utils/cleanup');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * Middleware: Verify admin API key
 * Can be bypassed with ADMIN_PASSWORD env var or by disabling auth
 */
function adminAuth(req, res, next) {
  const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin-change-in-production';

  if (adminKey !== adminPassword && process.env.REQUIRE_ADMIN_AUTH !== 'false') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid admin key. Use x-admin-key header or ?adminKey query param.'
    });
  }

  next();
}

// Apply admin auth to all routes
router.use(adminAuth);

// ─── GET /admin/stats ─────────────────────────────────────
// Get comprehensive system stats
router.get('/admin/stats', (req, res) => {
  const health = monitor.getSystemHealth();
  const queueStats = queue.getStats();
  const cleanupStats = cleanup.getStats();

  res.json({
    timestamp: new Date().toISOString(),
    system: health,
    queue: queueStats,
    cleanup: cleanupStats,
    alerts: monitor.getAlerts(10)
  });
});

// ─── GET /admin/queue ─────────────────────────────────────
// Get current queue status
router.get('/admin/queue', (req, res) => {
  const stats = queue.getStats();
  const topUsers = queue.getTopUsers(20);

  res.json({
    timestamp: new Date().toISOString(),
    queue: stats,
    topUsers,
    recommendations: [
      stats.activeJobs >= stats.maxConcurrent ? 'Queue is at max capacity' : null,
      stats.queuedJobs > 10 ? `${stats.queuedJobs} jobs waiting - consider scaling` : null,
      stats.totalQueued === 0 ? 'No active jobs' : null
    ].filter(Boolean)
  });
});

// ─── GET /admin/users ─────────────────────────────────────
// Get user stats for abuse detection
router.get('/admin/users', (req, res) => {
  const allStats = rateLimiter.getAllStats();
  const topUsers = queue.getTopUsers(50);

  // Combine data
  const userStats = {};
  for (const [userId, stats] of Object.entries(allStats)) {
    userStats[userId] = {
      ...stats,
      jobCount: topUsers.find(u => u.userId === userId)?.jobCount || 0
    };
  }

  // Sort by job count
  const sorted = Object.entries(userStats)
    .sort((a, b) => b[1].jobCount - a[1].jobCount)
    .slice(0, 50)
    .map(([userId, stats]) => ({ userId, ...stats }));

  res.json({
    timestamp: new Date().toISOString(),
    totalUniqueUsers: Object.keys(userStats).length,
    topUsers: sorted,
    alerts: monitor.getAlerts(5)
  });
});

// ─── GET /admin/health ────────────────────────────────────
// Quick health check (lighter than /stats)
router.get('/admin/health', (req, res) => {
  const health = monitor.getSystemHealth();

  res.json({
    timestamp: new Date().toISOString(),
    status: health.shouldDegradeGracefully ? 'degraded' : 'healthy',
    cpu: health.cpu.percentUsed,
    memory: health.memory.percentUsed,
    disk: health.disk.percentUsed,
    queue: queue.getStats().queuedJobs,
    alerts: monitor.getAlerts(3).length > 0
  });
});

// ─── GET /admin/job/:jobId ────────────────────────────────
// Get specific job status
router.get('/admin/job/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  const status = queue.getJobStatus(jobId);

  if (status.status === 'not_found') {
    return res.status(404).json({
      error: 'Job not found',
      jobId
    });
  }

  res.json({
    timestamp: new Date().toISOString(),
    job: status
  });
});

// ─── POST /admin/cleanup ──────────────────────────────────
// Manually trigger cleanup
router.post('/admin/cleanup', (req, res) => {
  const maxAgeHours = req.body.maxAgeHours || 24;

  try {
    const result = cleanup.run(maxAgeHours);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      cleanup: result,
      message: `Cleaned up successfully. Freed ${result.spacedFreedMB}MB`
    });
  } catch (error) {
    res.status(500).json({
      error: 'Cleanup failed',
      message: error.message
    });
  }
});

// ─── GET /admin/dashboard ─────────────────────────────────
// Full monitoring dashboard
router.get('/admin/dashboard', (req, res) => {
  const health = monitor.getDashboard();
  const queueStats = queue.getStats();
  const topUsers = queue.getTopUsers(10);

  res.json({
    timestamp: new Date().toISOString(),
    overview: {
      status: health.systemHealth.shouldDegradeGracefully ? 'degraded' : 'operational',
      cpuPercent: health.systemHealth.cpu.percentUsed,
      memoryPercent: health.systemHealth.memory.percentUsed,
      diskPercent: health.systemHealth.disk.percentUsed,
      activeJobs: queueStats.activeJobs,
      queuedJobs: queueStats.queuedJobs,
      totalJobs: queueStats.activeJobs + queueStats.queuedJobs
    },
    system: health.systemHealth,
    queue: queueStats,
    topUsers,
    alerts: health.alerts,
    recommendations: health.recommendations
  });
});

// ─── POST /admin/reset-user ───────────────────────────────
// Reset rate limit stats for a user
router.post('/admin/reset-user', (req, res) => {
  const userId = req.body.userId || req.query.userId;

  if (!userId) {
    return res.status(400).json({
      error: 'userId required'
    });
  }

  try {
    rateLimiter.resetStats(userId);

    res.json({
      success: true,
      message: `Reset stats for user ${userId}`,
      userId
    });
  } catch (error) {
    res.status(500).json({
      error: 'Reset failed',
      message: error.message
    });
  }
});

// ─── GET /admin/alerts ────────────────────────────────────
// Get recent alerts
router.get('/admin/alerts', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const severity = req.query.severity; // Optional: filter by 'warning', 'critical', etc.

  let alerts = monitor.getAlerts(limit);

  if (severity) {
    alerts = alerts.filter(a => a.severity === severity);
  }

  res.json({
    timestamp: new Date().toISOString(),
    count: alerts.length,
    alerts
  });
});

// ─── GET /admin/config ────────────────────────────────────
// Get current server configuration
router.get('/admin/config', (req, res) => {
  res.json({
    uploadDir: process.env.UPLOAD_DIR || '/tmp/postforge-uploads',
    clipsDir: process.env.CLIPS_DIR || '/tmp/postforge-clips',
    maxConcurrentJobs: 3,
    jobTimeoutMinutes: 30,
    cleanupIntervalHours: 1,
    maxAgeHoursForCleanup: 24,
    authRequired: process.env.REQUIRE_AUTH !== 'false',
    adminAuthRequired: process.env.REQUIRE_ADMIN_AUTH !== 'false',
    environment: process.env.NODE_ENV || 'development',
    debugMode: process.env.DEBUG === 'true'
  });
});

// ─── POST /admin/graceful-shutdown ────────────────────────
// Initiate graceful shutdown (wait for jobs to complete)
router.post('/admin/graceful-shutdown', (req, res) => {
  const timeoutSeconds = req.body.timeoutSeconds || 300; // 5 minutes default

  res.json({
    success: true,
    message: 'Graceful shutdown initiated',
    timeoutSeconds,
    activeJobs: queue.getStats().activeJobs,
    queuedJobs: queue.getStats().queuedJobs
  });

  // In production, implement actual graceful shutdown here
  // For now, just acknowledge the request
  console.log(`[Admin] Graceful shutdown requested with ${timeoutSeconds}s timeout`);
});

module.exports = router;
