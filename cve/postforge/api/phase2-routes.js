/**
 * Phase 2 API Routes (PostForge)
 * RESTful endpoints for schedule and approval management
 */

const express = require('express');
const router = express.Router();

// Middleware: Require authentication
const requireAuth = (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Store token for later use
  req.userToken = token;
  next();
};

module.exports = (app, db, scheduler, approval) => {
  // ===== SCHEDULE ENDPOINTS =====

  /**
   * GET /api/phase2/schedules
   * Get all schedules for user
   */
  app.get('/api/phase2/schedules', requireAuth, async (req, res) => {
    try {
      // Get user from auth module
      const auth = require('../auth');
      const user = await auth.getUser(req.userToken);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const schedules = await db.getSchedules(user.id);
      res.json({ schedules });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/phase2/schedules
   * Create new schedule
   */
  app.post('/api/phase2/schedules', requireAuth, async (req, res) => {
    try {
      const auth = require('../auth');
      const user = await auth.getUser(req.userToken);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const { frequency, time, platforms, industry, variations, autoApprove } = req.body;

      if (!frequency || !time || !platforms || !industry) {
        return res.status(400).json({
          error: 'Missing required fields'
        });
      }

      const schedule = await scheduler.createSchedule(user.id, {
        frequency,
        time,
        platforms,
        industry,
        variations: variations || 3,
        autoApprove: autoApprove || false
      });

      res.status(201).json({ success: true, schedule });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/phase2/schedules/:id/pause
   * Pause schedule
   */
  app.post('/api/phase2/schedules/:id/pause', requireAuth, async (req, res) => {
    try {
      await scheduler.pauseSchedule(req.params.id);
      res.json({ success: true, status: 'paused' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/phase2/schedules/:id/resume
   * Resume schedule
   */
  app.post('/api/phase2/schedules/:id/resume', requireAuth, async (req, res) => {
    try {
      await scheduler.resumeSchedule(req.params.id);
      res.json({ success: true, status: 'active' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * DELETE /api/phase2/schedules/:id
   * Delete schedule
   */
  app.delete('/api/phase2/schedules/:id', requireAuth, async (req, res) => {
    try {
      await scheduler.deleteSchedule(req.params.id);
      res.json({ success: true, deleted: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== APPROVAL ENDPOINTS =====

  /**
   * GET /api/phase2/approvals
   * Get pending approvals
   */
  app.get('/api/phase2/approvals', requireAuth, async (req, res) => {
    try {
      const auth = require('../auth');
      const user = await auth.getUser(req.userToken);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const approvals = await approval.getPendingApprovals(user.id);
      const stats = await approval.getApprovalStats(user.id);

      res.json({ approvals, stats });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/phase2/approvals/:id
   * Get approval details
   */
  app.get('/api/phase2/approvals/:id', requireAuth, async (req, res) => {
    try {
      const appr = await approval.getApproval(req.params.id);
      res.json({ approval: appr });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/phase2/approvals/:id/approve
   * Approve and select variant
   */
  app.post('/api/phase2/approvals/:id/approve', requireAuth, async (req, res) => {
    try {
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
   * POST /api/phase2/approvals/:id/reject
   * Reject approval
   */
  app.post('/api/phase2/approvals/:id/reject', requireAuth, async (req, res) => {
    try {
      const result = await approval.rejectApproval(req.params.id);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/phase2/approvals/:id/regenerate
   * Regenerate variants
   */
  app.post('/api/phase2/approvals/:id/regenerate', requireAuth, async (req, res) => {
    try {
      await approval.regenerateApproval(req.params.id, scheduler);
      res.json({ success: true, message: 'Variants regenerated' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
