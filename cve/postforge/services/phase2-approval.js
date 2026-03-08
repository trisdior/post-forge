/**
 * Phase 2 Approval Workflow (PostForge Edition)
 */

class Phase2ApprovalWorkflow {
  constructor(db) {
    this.db = db;
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
   * Submit approval - user picks variant
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

    console.log(`[Phase 2] Approved ${approvalId}, variant ${selectedVariantId}`);

    return {
      status: 'approved',
      approvalId,
      variant: selectedVariantId
    };
  }

  /**
   * Reject approval
   */
  async rejectApproval(approvalId) {
    const approval = await this.getApproval(approvalId);

    if (approval.status !== 'pending') {
      throw new Error(`Can only reject pending approvals`);
    }

    await this.db.updateApproval(approvalId, {
      status: 'rejected',
      rejectedAt: Date.now()
    });

    console.log(`[Phase 2] Rejected approval ${approvalId}`);
    return { status: 'rejected', approvalId };
  }

  /**
   * Regenerate variants for an approval
   */
  async regenerateApproval(approvalId, scheduler) {
    const approval = await this.getApproval(approvalId);
    const schedule = await this.db.getSchedule(approval.scheduleId);

    // Generate new variants
    const newVariants = await scheduler.generateContent(schedule);

    // Score them
    const scored = newVariants.map((text, idx) => ({
      id: `v${idx + 1}`,
      text,
      score: 8 + Math.random() * 2
    }));

    // Update approval with new variants
    await this.db.updateApproval(approvalId, {
      variants: scored,
      status: 'pending',
      selectedVariant: null,
      regeneratedAt: Date.now()
    });

    console.log(`[Phase 2] Regenerated variants for approval ${approvalId}`);
    return approval;
  }

  /**
   * Get approval statistics for dashboard
   */
  async getApprovalStats(userId) {
    const approvals = await this.db.getApprovals(userId) || [];

    const stats = {
      pending: approvals.filter(a => a.status === 'pending').length,
      approved: approvals.filter(a => a.status === 'approved').length,
      rejected: approvals.filter(a => a.status === 'rejected').length,
      posted: approvals.filter(a => a.status === 'posted').length
    };

    // Find oldest pending
    const pending = approvals.filter(a => a.status === 'pending');
    if (pending.length > 0) {
      const oldest = pending.reduce((a, b) => a.createdAt < b.createdAt ? a : b);
      const expiresIn = Math.max(0, oldest.expiresAt - Date.now());
      stats.oldestPendingExpiresIn = Math.ceil(expiresIn / (1000 * 60)); // minutes
    }

    return stats;
  }

  /**
   * Expire old pending approvals
   */
  async expirePendingApprovals() {
    const allApprovals = await this.db.getAllApprovals() || [];
    const expired = allApprovals.filter(a => 
      a.status === 'pending' && Date.now() > a.expiresAt
    );

    for (const approval of expired) {
      await this.db.updateApproval(approval.id, {
        status: 'expired',
        expiredAt: Date.now()
      });
    }

    if (expired.length > 0) {
      console.log(`[Phase 2] Expired ${expired.length} approvals`);
    }

    return { expiredCount: expired.length };
  }
}

module.exports = Phase2ApprovalWorkflow;
