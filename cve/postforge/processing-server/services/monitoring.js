/**
 * Monitoring Service
 * Tracks CPU, RAM, disk usage, bandwidth, and alerts
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class Monitor {
  constructor(uploadDir, clipsDir) {
    this.uploadDir = uploadDir;
    this.clipsDir = clipsDir;
    this.startTime = Date.now();
    this.alerts = [];
    this.metrics = [];
    this.ALERT_DISK_THRESHOLD = 0.80; // Alert at 80% full
    this.STOP_PROCESSING_THRESHOLD = 0.95; // Stop processing at 95% full
    this.ALERT_BANDWIDTH_THRESHOLD = 0.90; // Alert at 90% monthly
    this.ALERT_CPU_THRESHOLD = 0.90; // Alert at 90% CPU
  }

  /**
   * Get current CPU usage percentage
   * @returns {number} CPU percentage (0-100)
   */
  getCPUUsage() {
    try {
      const cpus = os.cpus();
      const avgLoad = os.loadavg()[0]; // 1-minute average
      const numCPUs = cpus.length;
      const usage = (avgLoad / numCPUs) * 100;
      return Math.min(100, Math.round(usage));
    } catch (e) {
      return 0;
    }
  }

  /**
   * Get memory usage
   * @returns {object} Memory stats
   */
  getMemoryUsage() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const percentUsed = (used / total) * 100;

    return {
      totalGB: Math.round(total / (1024 * 1024 * 1024) * 100) / 100,
      usedGB: Math.round(used / (1024 * 1024 * 1024) * 100) / 100,
      freeGB: Math.round(free / (1024 * 1024 * 1024) * 100) / 100,
      percentUsed: Math.round(percentUsed)
    };
  }

  /**
   * Get disk usage
   * @returns {object} Disk stats
   */
  getDiskUsage() {
    try {
      let uploadSize = 0;
      let clipsSize = 0;

      // Calculate directory sizes
      if (fs.existsSync(this.uploadDir)) {
        uploadSize = this.getDirSize(this.uploadDir);
      }

      if (fs.existsSync(this.clipsDir)) {
        clipsSize = this.getDirSize(this.clipsDir);
      }

      const totalUsed = uploadSize + clipsSize;
      const totalGB = 500; // Assume 500GB total capacity (configurable)
      const percentUsed = (totalUsed / (totalGB * 1024 * 1024 * 1024)) * 100;

      // Check thresholds
      if (percentUsed >= this.STOP_PROCESSING_THRESHOLD * 100) {
        this.addAlert('critical', 'disk_full', `Disk ${percentUsed.toFixed(1)}% full. Processing stopped.`);
      } else if (percentUsed >= this.ALERT_DISK_THRESHOLD * 100) {
        this.addAlert('warning', 'disk_warning', `Disk ${percentUsed.toFixed(1)}% full. Consider cleanup.`);
      }

      return {
        uploadDirGB: Math.round(uploadSize / (1024 * 1024 * 1024) * 100) / 100,
        clipsDirGB: Math.round(clipsSize / (1024 * 1024 * 1024) * 100) / 100,
        totalUsedGB: Math.round(totalUsed / (1024 * 1024 * 1024) * 100) / 100,
        totalCapacityGB: totalGB,
        percentUsed: Math.round(percentUsed),
        shouldStop: percentUsed >= this.STOP_PROCESSING_THRESHOLD * 100
      };
    } catch (e) {
      console.error('Error calculating disk usage:', e.message);
      return {
        uploadDirGB: 0,
        clipsDirGB: 0,
        totalUsedGB: 0,
        totalCapacityGB: 500,
        percentUsed: 0,
        shouldStop: false,
        error: e.message
      };
    }
  }

  /**
   * Get directory size in bytes
   * @private
   */
  getDirSize(dir) {
    let size = 0;

    try {
      if (!fs.existsSync(dir)) return 0;

      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);

        if (stat.isDirectory()) {
          size += this.getDirSize(filepath);
        } else {
          size += stat.size;
        }
      }
    } catch (e) {
      console.error(`Error calculating size of ${dir}:`, e.message);
    }

    return size;
  }

  /**
   * Get system health snapshot
   * @returns {object} Complete health stats
   */
  getSystemHealth() {
    const cpu = this.getCPUUsage();
    const memory = this.getMemoryUsage();
    const disk = this.getDiskUsage();

    // Alert on high CPU
    if (cpu >= this.ALERT_CPU_THRESHOLD * 100) {
      this.addAlert('warning', 'high_cpu', `CPU usage at ${cpu}%. Queueing jobs instead of processing.`);
    }

    return {
      timestamp: new Date().toISOString(),
      uptime: Math.round((Date.now() - this.startTime) / 1000),
      cpu: {
        percentUsed: cpu,
        alert: cpu >= this.ALERT_CPU_THRESHOLD * 100
      },
      memory,
      disk,
      shouldDegradeGracefully: cpu >= this.ALERT_CPU_THRESHOLD * 100 || disk.shouldStop
    };
  }

  /**
   * Add an alert
   * @private
   */
  addAlert(severity, type, message) {
    const alert = {
      timestamp: new Date().toISOString(),
      severity, // 'info', 'warning', 'critical'
      type,
      message
    };

    this.alerts.push(alert);

    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts.shift();
    }

    // Log to console
    if (severity === 'critical' || severity === 'warning') {
      console.warn(`[ALERT] ${severity.toUpperCase()}: ${message}`);
    } else {
      console.log(`[ALERT] ${message}`);
    }
  }

  /**
   * Get recent alerts
   * @param {number} limit
   * @returns {array} Recent alerts
   */
  getAlerts(limit = 50) {
    return this.alerts.slice(-limit).reverse();
  }

  /**
   * Check bandwidth usage (mock - would use actual traffic data in production)
   * @param {string} userId - (optional) specific user
   * @returns {object} Bandwidth stats
   */
  getBandwidthStats(userId = null) {
    // In production, this would track actual download/upload traffic
    // For now, return placeholder
    return {
      monthlyUsageGB: 0,
      monthlyLimitGB: userId ? 50 : 500,
      percentUsed: 0,
      usageByUser: {} // Would be populated from actual traffic data
    };
  }

  /**
   * Get full monitoring dashboard
   * @returns {object} Complete monitoring snapshot
   */
  getDashboard() {
    return {
      timestamp: new Date().toISOString(),
      systemHealth: this.getSystemHealth(),
      alerts: this.getAlerts(20),
      bandwidth: this.getBandwidthStats(),
      recommendations: this.getRecommendations()
    };
  }

  /**
   * Get recommendations based on current metrics
   * @private
   */
  getRecommendations() {
    const health = this.getSystemHealth();
    const recommendations = [];

    if (health.disk.percentUsed > 70) {
      recommendations.push({
        priority: 'high',
        message: 'Disk usage high. Run cleanup to delete files older than 24 hours.',
        action: 'POST /cleanup'
      });
    }

    if (health.cpu >= 80) {
      recommendations.push({
        priority: 'high',
        message: 'CPU usage high. Server will queue new jobs instead of processing.',
        action: 'Monitor queue, consider scaling'
      });
    }

    if (health.memory.percentUsed > 85) {
      recommendations.push({
        priority: 'medium',
        message: 'Memory usage high. Monitor for memory leaks.',
        action: 'Check active processes'
      });
    }

    return recommendations;
  }

  /**
   * Record a metric (for historical tracking)
   * @private
   */
  recordMetric() {
    const health = this.getSystemHealth();
    this.metrics.push(health);

    // Keep only last 1000 metrics (24 hours at 1 per minute)
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }
  }
}

// Global monitor instance
const monitor = new Monitor(
  process.env.UPLOAD_DIR || '/tmp/postforge-uploads',
  process.env.CLIPS_DIR || '/tmp/postforge-clips'
);

// Record metrics every minute
setInterval(() => {
  monitor.recordMetric();
}, 60000);

module.exports = {
  monitor,
  Monitor
};
