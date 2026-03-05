/**
 * Tier Configuration for PostForge
 * Defines limits for Free, Growth, Pro, and Business tiers
 */

const TIERS = {
  free: {
    name: 'Free',
    clipsPerMonth: 5,
    maxFileSizeBytes: 100 * 1024 * 1024, // 100MB
    maxConcurrentJobs: 1,
    queuePriority: 'low',
    bandwidthPerMonthGB: 1,
    storageGB: 0.5,
    features: {
      basicTranscription: true,
      advancedAnalysis: false,
      customCaptions: false,
      priorityProcessing: false,
      apiAccess: false
    }
  },

  growth: {
    name: 'Growth',
    clipsPerMonth: 50,
    maxFileSizeBytes: 500 * 1024 * 1024, // 500MB
    maxConcurrentJobs: 2,
    queuePriority: 'medium',
    bandwidthPerMonthGB: 10,
    storageGB: 5,
    features: {
      basicTranscription: true,
      advancedAnalysis: true,
      customCaptions: true,
      priorityProcessing: false,
      apiAccess: false
    }
  },

  pro: {
    name: 'Pro',
    clipsPerMonth: 150,
    maxFileSizeBytes: 1 * 1024 * 1024 * 1024, // 1GB
    maxConcurrentJobs: 3,
    queuePriority: 'high',
    bandwidthPerMonthGB: 50,
    storageGB: 20,
    features: {
      basicTranscription: true,
      advancedAnalysis: true,
      customCaptions: true,
      priorityProcessing: true,
      apiAccess: false
    }
  },

  business: {
    name: 'Business',
    clipsPerMonth: 500,
    maxFileSizeBytes: 5 * 1024 * 1024 * 1024, // 5GB
    maxConcurrentJobs: 5,
    queuePriority: 'critical',
    bandwidthPerMonthGB: 200,
    storageGB: 100,
    features: {
      basicTranscription: true,
      advancedAnalysis: true,
      customCaptions: true,
      priorityProcessing: true,
      apiAccess: true
    }
  }
};

/**
 * Get tier configuration by name
 * @param {string} tierName - Tier name (free, growth, pro, business)
 * @returns {object} Tier configuration or default (free)
 */
function getTier(tierName) {
  return TIERS[tierName?.toLowerCase()] || TIERS.free;
}

/**
 * Get limit exceeded message
 * @param {string} tierName
 * @param {string} limitType - 'clips', 'fileSize', 'bandwidth', 'storage', 'concurrent'
 * @returns {string} User-friendly error message
 */
function getLimitExceededMessage(tierName, limitType) {
  const tier = getTier(tierName);
  const tierUpper = tier.name;

  switch (limitType) {
    case 'clips':
      return `Clip limit reached. You've used ${tier.clipsPerMonth}/${tier.clipsPerMonth} clips this month. Upgrade to ${tier.name === 'Business' ? 'Enterprise' : 'the next tier'} for more.`;

    case 'fileSize':
      const maxSizeMB = tier.maxFileSizeBytes / (1024 * 1024);
      return `File too large. Max ${maxSizeMB}MB for ${tierUpper} tier. Upgrade to Pro for 1GB.`;

    case 'bandwidth':
      return `Monthly bandwidth exceeded. You have ${tier.bandwidthPerMonthGB}GB/month on ${tierUpper} tier.`;

    case 'storage':
      return `Storage quota exceeded. Max ${tier.storageGB}GB on ${tierUpper} tier.`;

    case 'concurrent':
      return `Server busy. Your clip is queued. Max ${tier.maxConcurrentJobs} concurrent jobs on ${tierUpper} tier.`;

    default:
      return 'Limit exceeded. Please upgrade your plan.';
  }
}

module.exports = {
  TIERS,
  getTier,
  getLimitExceededMessage
};
