/**
 * Schedule Database Schema
 * For MongoDB, Postgres, or your preferred DB
 */

// MongoDB Schema Example
const scheduleSchema = {
  _id: 'ObjectId',
  userId: 'String (ref User)',
  type: 'daily|weekly|custom',
  frequency: 'String (daily, weekly, custom, etc)',
  time: 'String (HH:MM format)',
  cronExpression: 'String (0 11 * * 1)',
  platforms: 'Array[String] (twitter, linkedin, facebook, instagram)',
  industry: 'String (marketing, saas, personal-brand, news-commentary)',
  variations: 'Number (3, 5, etc)',
  autoApprove: 'Boolean (auto-post best variant?)',
  isActive: 'Boolean',
  createdAt: 'Date',
  updatedAt: 'Date',
  nextRun: 'Date',
  lastRun: 'Date',
  jobId: 'String (Bull queue job ID)'
};

// SQL Schema Example (Postgres)
const scheduleSQL = `
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL DEFAULT 'recurring',
  frequency VARCHAR(50) NOT NULL, -- daily, weekly, custom, etc
  time TIME NOT NULL, -- 11:00
  cron_expression VARCHAR(100), -- 0 11 * * 1
  platforms TEXT[] NOT NULL, -- {twitter, linkedin}
  industry VARCHAR(50) NOT NULL,
  variations INTEGER NOT NULL DEFAULT 3,
  auto_approve BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  next_run TIMESTAMP,
  last_run TIMESTAMP,
  job_id VARCHAR(255),
  CONSTRAINT valid_variations CHECK (variations > 0 AND variations <= 5)
);

CREATE INDEX idx_schedules_user_id ON schedules(user_id);
CREATE INDEX idx_schedules_is_active ON schedules(is_active);
`;

// Validation schema
const validateScheduleInput = (data) => {
  const errors = [];

  if (!data.frequency) errors.push('frequency is required');
  if (!['daily', 'weekly', 'monthly', 'custom'].includes(data.frequency)) {
    errors.push('frequency must be daily, weekly, monthly, or custom');
  }

  if (!data.time) errors.push('time is required');
  if (!/^\d{2}:\d{2}$/.test(data.time)) {
    errors.push('time must be in HH:MM format');
  }

  if (!data.platforms || data.platforms.length === 0) {
    errors.push('at least one platform is required');
  }
  const validPlatforms = ['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok'];
  if (data.platforms.some(p => !validPlatforms.includes(p))) {
    errors.push(`platforms must be one of: ${validPlatforms.join(', ')}`);
  }

  if (!data.industry) errors.push('industry is required');

  if (data.variations && (data.variations < 1 || data.variations > 5)) {
    errors.push('variations must be between 1 and 5');
  }

  return errors;
};

module.exports = {
  scheduleSchema,
  scheduleSQL,
  validateScheduleInput
};
