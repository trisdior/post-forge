/**
 * Approval Database Schema
 * Stores pending/approved content variants waiting for user selection
 */

// MongoDB Schema Example
const approvalSchema = {
  _id: 'ObjectId',
  userId: 'String (ref User)',
  scheduleId: 'String (ref Schedule)',
  variants: [
    {
      id: 'String (v1, v2, v3)',
      text: 'String (content)',
      images: 'Array[String] (URLs)',
      score: 'Number (7-10 quality score)',
      promptUsed: 'String (which prompt generated this)'
    }
  ],
  selectedVariant: 'String or null (v1, v2, etc)',
  status: 'pending|approved|rejected|expired|posted',
  postSettings: {
    platforms: 'Array[String]',
    postAt: 'Date (when to post)',
    autoPost: 'Boolean (auto-post or manual)'
  },
  createdAt: 'Date (when variants were generated)',
  selectedAt: 'Date (when user picked variant)',
  approvedAt: 'Date (when approval was finalized)',
  rejectedAt: 'Date (when rejected)',
  expiredAt: 'Date (if expired)',
  regeneratedAt: 'Date (if regenerated)',
  expiresAt: 'Date (4 hour approval window)'
};

// SQL Schema Example (Postgres)
const approvalSQL = `
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  selected_variant VARCHAR(10),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  selected_at TIMESTAMP,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  expired_at TIMESTAMP,
  regenerated_at TIMESTAMP,
  auto_post BOOLEAN NOT NULL DEFAULT true,
  post_at TIMESTAMP,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'posted'))
);

CREATE TABLE approval_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id UUID NOT NULL REFERENCES approvals(id) ON DELETE CASCADE,
  variant_id VARCHAR(10) NOT NULL, -- v1, v2, v3
  text TEXT NOT NULL,
  images TEXT[], -- Array of image URLs
  score DECIMAL(3,1) NOT NULL, -- 7.5, 8.2, etc
  prompt_used VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(approval_id, variant_id)
);

CREATE INDEX idx_approvals_user_id ON approvals(user_id);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_expires_at ON approvals(expires_at);
`;

// Approval States and Transitions
const approvalStateMachine = {
  'pending': {
    transitions: {
      'approve': 'approved',
      'reject': 'rejected',
      'regenerate': 'pending',
      'expire': 'expired'
    },
    ttl: 4 * 60 * 60 * 1000 // 4 hours
  },
  'approved': {
    transitions: {
      'post': 'posted'
    }
  },
  'rejected': {
    transitions: {
      'regenerate': 'pending'
    }
  },
  'posted': {
    transitions: {} // Terminal state
  },
  'expired': {
    transitions: {} // Terminal state
  }
};

// Validation schema
const validateApprovalSelection = (approval, selectedVariantId) => {
  const errors = [];

  if (!selectedVariantId) {
    errors.push('selectedVariant is required');
  }

  const variant = approval.variants.find(v => v.id === selectedVariantId);
  if (!variant) {
    errors.push(`variant ${selectedVariantId} not found`);
  }

  if (approval.status !== 'pending') {
    errors.push(`approval is already ${approval.status}`);
  }

  if (Date.now() > approval.expiresAt) {
    errors.push('approval has expired');
  }

  return errors;
};

module.exports = {
  approvalSchema,
  approvalSQL,
  approvalStateMachine,
  validateApprovalSelection
};
