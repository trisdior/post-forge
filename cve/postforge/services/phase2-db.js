/**
 * Phase 2 Database Adapter
 * Maps Phase 2 services to PostForge's Redis + JSON file system
 */

const path = require('path');
const fs = require('fs');

function getDataPath(filename) {
  const dir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, filename);
}

function readJSON(file, fallback = {}) {
  try {
    return JSON.parse(fs.readFileSync(getDataPath(file), 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(getDataPath(file), JSON.stringify(data, null, 2));
}

class Phase2DB {
  constructor(redis) {
    this.redis = redis;
  }

  // ===== SCHEDULES =====
  async getSchedules(userId) {
    const schedules = readJSON('phase2-schedules.json', {});
    return Object.values(schedules).filter(s => s.userId === userId);
  }

  async getSchedule(scheduleId) {
    const schedules = readJSON('phase2-schedules.json', {});
    return schedules[scheduleId] || null;
  }

  async createSchedule(schedule) {
    const schedules = readJSON('phase2-schedules.json', {});
    schedules[schedule.id] = schedule;
    writeJSON('phase2-schedules.json', schedules);
    return schedule;
  }

  async updateSchedule(scheduleId, updates) {
    const schedules = readJSON('phase2-schedules.json', {});
    schedules[scheduleId] = { ...schedules[scheduleId], ...updates };
    writeJSON('phase2-schedules.json', schedules);
    return schedules[scheduleId];
  }

  async deleteSchedule(scheduleId) {
    const schedules = readJSON('phase2-schedules.json', {});
    delete schedules[scheduleId];
    writeJSON('phase2-schedules.json', schedules);
  }

  // ===== APPROVALS =====
  async getApprovals(userId, filters = {}) {
    const approvals = readJSON('phase2-approvals.json', {});
    let result = Object.values(approvals).filter(a => a.userId === userId);
    
    if (filters.status) {
      result = result.filter(a => a.status === filters.status);
    }
    
    return result;
  }

  async getApproval(approvalId) {
    const approvals = readJSON('phase2-approvals.json', {});
    return approvals[approvalId] || null;
  }

  async createApproval(approval) {
    const approvals = readJSON('phase2-approvals.json', {});
    approvals[approval.id] = approval;
    writeJSON('phase2-approvals.json', approvals);
    return approval;
  }

  async updateApproval(approvalId, updates) {
    const approvals = readJSON('phase2-approvals.json', {});
    approvals[approvalId] = { ...approvals[approvalId], ...updates };
    writeJSON('phase2-approvals.json', approvals);
    return approvals[approvalId];
  }

  async getAllApprovals() {
    const approvals = readJSON('phase2-approvals.json', {});
    return Object.values(approvals);
  }
}

module.exports = Phase2DB;
