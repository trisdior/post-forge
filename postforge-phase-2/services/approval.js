/**
 * PostForge Phase 2: Approval Workflow Service
 * Handles approval queue, variant selection, and post scheduling
 */

class ApprovalWorkflow {
  constructor(db, postingQueue) {
    this.db = db;
    this.postingQueue = postingQueue;
  }

  /**
   * Get pending approvals for user
   */
  async getPendingApprovals(userId) {
    return await this.db.getApprovals(userId, { status: 'pending' });
  }

  /**
   * Get approval details
   */
  async getApproval(approvalId) {
    const approval = await this.db.getApproval(approvalId);

    if (!approval) {
      throw new Error(`Approval ${approvalId} not found`);
    }

    // Check if expired
    if (Date.now() > approval.expiresAt) {
      approval.status = 'expired';
    }

    return approval;
  }

  /**
   * Submit approval - user picks variant and optionally schedules post
   */
  async submitApproval(approvalId, selectedVariantId, postSettings = {}) {
    const approval = await this.getApproval(approvalId);

    // Validate
    if (approval.status !== 'pending') {
      throw new Error(`Approval ${approvalId} is already ${approval.status}`);
    }

    if (Date.now() > approval.expiresAt) {
      throw new Error(`Approval ${approvalId} has expired`);
    }

    const variant = approval.variants.find(v => v.id === selectedVariantId);
    if (!variant) {
      throw new Error(`Variant ${selectedVariantId} not found in approval`);
    }

    // Update approval
    await this.db.updateApproval(approvalId, {
      status: 'approved',
      selectedVariant: selectedVariantId,
      selectedAt: Date.now(),
      postSettings
    });

    // Decide: post now or schedule for later
    const postAt = postSettings.postAt || Date.now();
    const shouldAutoPost = postSettings.autoPost !== false; // Default true

    if (shouldAutoPost) {
      // Schedule the post
      await this.schedulePost(approvalId, variant, approval, postSettings);

      return {
        status: 'approved-and-scheduled',
        approvalId,
        postAt,
        variant: selectedVariantId
      };
    } else {
      // Mark as ready but waiting for user to click "Post"
      await this.db.updateApproval(approvalId, {
        status: 'approved-ready-to-post'
      });

      return {
        status: 'approved-ready-to-post',
        approvalId,
        variant: selectedVariantId
      };
    }
  }

  /**
   * Schedule a post for delivery
   */
  async schedulePost(approvalId, variant, approval, settings) {
    const postAt = settings.postAt || Date.now();
    const platforms = settings.platforms || approval.schedule.platforms;

    const postJob = {
      approvalId,
      userId: approval.userId,
      variant,
      platforms,
      postAt,
      text: variant.text,
      images: variant.images || []
    };

    const delay = Math.max(0, postAt - Date.now());

    // Add to posting queue
    const job = await this.postingQueue.add(postJob, {
      delay,
      jobId: `post_${approvalId}_${Date.now()}`,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });

    console.log(`[APPROVAL] Scheduled post ${job.id} for ${new Date(postAt).toISOString()}`);

    return {
      jobId: job.id,
      postAt,
      scheduledFor: new Date(postAt).toISOString()
    };
  }

  /**
   * Reject approval and optionally regenerate variants
   */
  async rejectApproval(approvalId, options = {}) {
    const approval = await this.getApproval(approvalId);

    if (approval.status !== 'pending') {
      throw new Error(`Can only reject pending approvals`);
    }

    await this.db.updateApproval(approvalId, {
      status: 'rejected',
      rejectedAt: Date.now()
    });

    // Optionally regenerate
    if (options.regenerate) {
      const newApproval = await this.regenerateApproval(approvalId);
      return { status: 'rejected-and-regenerated', newApprovalId: newApproval.id };
    }

    return { status: 'rejected', approvalId };
  }

  /**
   * Regenerate variants for an approval
   */
  async regenerateApproval(approvalId) {
    const approval = await this.getApproval(approvalId);
    const schedule = await this.db.getSchedule(approval.scheduleId);

    // Import Claude generation function
    const { generateContent } = require('./claude');

    // Generate new variants
    const newVariants = await generateContent({
      industry: schedule.industry,
      platforms: schedule.platforms,
      variations: schedule.variations || 3
    });

    // Score them
    const scored = newVariants.map((variant, idx) => ({
      id: `v${idx + 1}`,
      text: variant,
      score: Math.random() * 2 + 7 // Replace with real scoring
    }));

    // Update approval with new variants
    await this.db.updateApproval(approvalId, {
      variants: scored,
      status: 'pending', // Back to pending
      selectedVariant: null,
      regeneratedAt: Date.now()
    });

    return approval;
  }

  /**
   * User manually posts approved content (if they didn't use autoPost)
   */
  async manuallyPost(approvalId) {
    const approval = await this.getApproval(approvalId);

    if (approval.status !== 'approved-ready-to-post') {
      throw new Error(`Approval must be in 'approved-ready-to-post' status`);
    }

    const variant = approval.variants.find(v => v.id === approval.selectedVariant);
    if (!variant) {
      throw new Error(`Selected variant not found`);
    }

    // Post immediately
    const result = await this.schedulePost(approvalId, variant, approval, {
      autoPost: true
    });

    return result;
  }

  /**
   * Get approval statistics for dashboard
   */
  async getApprovalStats(userId) {
    const approvals = await this.db.getApprovals(userId);

    const stats = {
      pending: approvals.filter(a => a.status === 'pending').length,
      approved: approvals.filter(a => a.status.includes('approved')).length,
      rejected: approvals.filter(a => a.status === 'rejected').length,
      posted: approvals.filter(a => a.status === 'posted').length,
      averageApprovalTime: this.calculateAverageApprovalTime(approvals)
    };

    // Find oldest pending approval
    const pending = approvals.filter(a => a.status === 'pending');
    if (pending.length > 0) {
      const oldest = pending.reduce((a, b) => a.createdAt < b.createdAt ? a : b);
      const expiresIn = Math.max(0, oldest.expiresAt - Date.now());
      stats.oldestPendingExpiresIn = Math.ceil(expiresIn / (1000 * 60)); // minutes
    }

    return stats;
  }

  /**
   * Calculate average approval time
   */
  calculateAverageApprovalTime(approvals) {
    const approved = approvals.filter(a => a.selectedAt);
    if (approved.length === 0) return 0;

    const times = approved.map(a => a.selectedAt - a.createdAt);
    const sum = times.reduce((a, b) => a + b, 0);
    return Math.round(sum / times.length / (1000 * 60)); // Return in minutes
  }

  /**
   * Expire old pending approvals
   */
  async expirePendingApprovals() {
    const allApprovals = await this.db.getAllApprovals();
    const expired = allApprovals.filter(a => 
      a.status === 'pending' && Date.now() > a.expiresAt
    );

    for (const approval of expired) {
      await this.db.updateApproval(approval.id, {
        status: 'expired',
        expiredAt: Date.now()
      });
    }

    return { expiredCount: expired.length };
  }
}

module.exports = ApprovalWorkflow;
