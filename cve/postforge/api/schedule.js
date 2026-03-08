/**
 * PostForge Phase 2: Schedule API Routes
 * RESTful endpoints for schedule and approval management
 */

const express = require('express');
const router = express.Router();

// Middleware: Require authentication (implement as needed)
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

module.exports = (db, scheduler, approval) => {
  // ===== SCHEDULE ENDPOINTS =====

  /**
   * GET /api/schedules
   * Get all schedules for authenticated user
   */
  router.get('/schedules', requireAuth, async (req, res) => {
    try {
      const schedules = await scheduler.getUserSchedules(req.user.id);
      res.json({ schedules });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/schedules
   * Create a new schedule
   * Body: { frequency, time, platforms, industry, variations, autoApprove }
   */
  router.post('/schedules', requireAuth, async (req, res) => {
    try {
      const { frequency, time, platforms, industry, variations, autoApprove } = req.body;

      // Validate required fields
      if (!frequency || !time || !platforms || !industry) {
        return res.status(400).json({
          error: 'Missing required fields: frequency, time, platforms, industry'
        });
      }

      const schedule = await scheduler.createSchedule(req.user.id, {
        frequency,
        time,
        platforms,
        industry,
        variations: variations || 3,
        autoApprove: autoApprove !== false
      });

      res.status(201).json({
        success: true,
        schedule
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/schedules/:id
   * Get schedule details
   */
  router.get('/schedules/:id', requireAuth, async (req, res) => {
    try {
      const schedule = await scheduler.getScheduleFromDB(req.params.id);
      
      // Verify ownership
      if (schedule.userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      res.json({ schedule });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * PUT /api/schedules/:id
   * Update a schedule
   */
  router.put('/schedules/:id', requireAuth, async (req, res) => {
    try {
      const schedule = await scheduler.getScheduleFromDB(req.params.id);
      
      // Verify ownership
      if (schedule.userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const updated = await scheduler.updateSchedule(req.params.id, req.body);
      res.json({ success: true, schedule: updated });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/schedules/:id/pause
   * Pause a schedule
   */
  router.post('/schedules/:id/pause', requireAuth, async (req, res) => {
    try {
      const schedule = await scheduler.getScheduleFromDB(req.params.id);
      
      if (schedule.userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await scheduler.pauseSchedule(req.params.id);
      res.json({ success: true, status: 'paused' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/schedules/:id/resume
   * Resume a paused schedule
   */
  router.post('/schedules/:id/resume', requireAuth, async (req, res) => {
    try {
      const schedule = await scheduler.getScheduleFromDB(req.params.id);
      
      if (schedule.userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await scheduler.resumeSchedule(req.params.id);
      res.json({ success: true, status: 'active' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * DELETE /api/schedules/:id
   * Delete a schedule
   */
  router.delete('/schedules/:id', requireAuth, async (req, res) => {
    try {
      const schedule = await scheduler.getScheduleFromDB(req.params.id);
      
      if (schedule.userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await scheduler.deleteSchedule(req.params.id);
      res.json({ success: true, deleted: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== APPROVAL ENDPOINTS =====

  /**
   * GET /api/approvals
   * Get all pending approvals for user
   */
  router.get('/approvals', requireAuth, async (req, res) => {
    try {
      const approvals = await approval.getPendingApprovals(req.user.id);
      const stats = await approval.getApprovalStats(req.user.id);
      
      res.json({
        approvals,
        stats
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/approvals/:id
   * Get approval details
   */
  router.get('/approvals/:id', requireAuth, async (req, res) => {
    try {
      const appr = await approval.getApproval(req.params.id);
      
      // Verify ownership
      if (appr.userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      res.json({ approval: appr });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/approvals/:id/approve
   * User selects a variant and approves
   * Body: { selectedVariant, postAt, autoPost }
   */
  router.post('/approvals/:id/approve', requireAuth, async (req, res) => {
    try {
      const appr = await approval.getApproval(req.params.id);
      
      if (appr.userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { selectedVariant, postAt, autoPost } = req.body;

      if (!selectedVariant) {
        return res.status(400).json({ error: 'selectedVariant required' });
      }

      const result = await approval.submitApproval(req.params.id, selectedVariant, {
        postAt: postAt ? new Date(postAt).getTime() : Date.now(),
        autoPost: autoPost !== false
      });

      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/approvals/:id/reject
   * Reject approval
   * Body: { regenerate? }
   */
  router.post('/approvals/:id/reject', requireAuth, async (req, res) => {
    try {
      const appr = await approval.getApproval(req.params.id);
      
      if (appr.userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { regenerate } = req.body;
      const result = await approval.rejectApproval(req.params.id, { regenerate });

      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/approvals/:id/regenerate
   * Regenerate variants for an approval
   */
  router.post('/approvals/:id/regenerate', requireAuth, async (req, res) => {
    try {
      const appr = await approval.getApproval(req.params.id);
      
      if (appr.userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await approval.regenerateApproval(req.params.id);
      res.json({ success: true, message: 'Variants regenerated' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/approvals/:id/post
   * Manually post an approved item (if not using autoPost)
   */
  router.post('/approvals/:id/post', requireAuth, async (req, res) => {
    try {
      const appr = await approval.getApproval(req.params.id);
      
      if (appr.userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const result = await approval.manuallyPost(req.params.id);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/maintenance/expire-approvals
   * Run maintenance to expire old approvals (call periodically)
   */
  router.post('/maintenance/expire-approvals', async (req, res) => {
    try {
      const result = await approval.expirePendingApprovals();
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
