/**
 * PostForge Phase 2: Schedule Builder Component
 * Create and manage recurring content schedules
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ScheduleBuilder() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    frequency: 'daily',
    time: '11:00',
    platforms: ['twitter', 'linkedin'],
    industry: 'marketing',
    variations: 3,
    autoApprove: false
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get('/api/schedules');
      setSchedules(res.data.schedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handlePlatformToggle = (platform) => {
    const platforms = formData.platforms.includes(platform)
      ? formData.platforms.filter(p => p !== platform)
      : [...formData.platforms, platform];
    setFormData({ ...formData, platforms });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.platforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    setSubmitting(true);

    try {
      const res = await axios.post('/api/schedules', formData);
      setSchedules([...schedules, res.data.schedule]);
      setFormData({
        frequency: 'daily',
        time: '11:00',
        platforms: ['twitter', 'linkedin'],
        industry: 'marketing',
        variations: 3,
        autoApprove: false
      });
      setShowForm(false);
      alert('✅ Schedule created!');
    } catch (error) {
      alert('Error: ' + error.response?.data?.error || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const pauseSchedule = async (scheduleId) => {
    try {
      await axios.post(`/api/schedules/${scheduleId}/pause`);
      fetchSchedules();
    } catch (error) {
      alert('Error: ' + error.response?.data?.error || error.message);
    }
  };

  const resumeSchedule = async (scheduleId) => {
    try {
      await axios.post(`/api/schedules/${scheduleId}/resume`);
      fetchSchedules();
    } catch (error) {
      alert('Error: ' + error.response?.data?.error || error.message);
    }
  };

  const deleteSchedule = async (scheduleId) => {
    if (!confirm('Delete this schedule? (content already generated will remain)')) return;

    try {
      await axios.delete(`/api/schedules/${scheduleId}`);
      setSchedules(schedules.filter(s => s.id !== scheduleId));
    } catch (error) {
      alert('Error: ' + error.response?.data?.error || error.message);
    }
  };

  if (loading) {
    return <div className="schedule-builder loading">Loading schedules...</div>;
  }

  return (
    <div className="schedule-builder">
      <h1>📅 Content Schedule</h1>

      {/* Active Schedules */}
      <div className="active-schedules">
        <div className="section-header">
          <h2>Your Schedules</h2>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ New Schedule'}
          </button>
        </div>

        {schedules.length === 0 ? (
          <p className="empty">No schedules yet. Create one to get started!</p>
        ) : (
          <div className="schedule-items">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="schedule-item">
                <h3>{schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} at {schedule.time}</h3>
                <p>Platforms: {schedule.platforms.join(', ')}</p>
                <p>Industry: {schedule.industry}</p>
                <p>Variations: {schedule.variations}</p>
                <p className={schedule.isActive ? 'status-active' : 'status-paused'}>
                  {schedule.isActive ? '🟢 Active' : '🔴 Paused'}
                </p>

                <div className="actions">
                  {schedule.isActive ? (
                    <button className="btn-small" onClick={() => pauseSchedule(schedule.id)}>
                      ⏸ Pause
                    </button>
                  ) : (
                    <button className="btn-small" onClick={() => resumeSchedule(schedule.id)}>
                      ▶ Resume
                    </button>
                  )}
                  <button className="btn-small btn-danger" onClick={() => deleteSchedule(schedule.id)}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="schedule-form">
          <h2>Create New Schedule</h2>

          <div className="form-group">
            <label htmlFor="frequency">How often?</label>
            <select
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleInputChange}
            >
              <option value="daily">Every Day</option>
              <option value="weekly">Every Week</option>
              <option value="monthly">Every Month</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="time">What time?</label>
            <input
              id="time"
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Which platforms?</label>
            <div className="checkboxes">
              {['twitter', 'linkedin', 'facebook', 'instagram'].map((platform) => (
                <label key={platform}>
                  <input
                    type="checkbox"
                    checked={formData.platforms.includes(platform)}
                    onChange={() => handlePlatformToggle(platform)}
                  />
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="industry">Content type?</label>
            <select
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
            >
              <option value="marketing">Marketing</option>
              <option value="saas">SaaS</option>
              <option value="personal-brand">Personal Brand</option>
              <option value="news-commentary">News Commentary</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="variations">Generate how many versions?</label>
            <select
              id="variations"
              name="variations"
              value={formData.variations}
              onChange={handleInputChange}
            >
              <option value={1}>1 (standard)</option>
              <option value={3}>3 (compare)</option>
              <option value={5}>5 (deep dive)</option>
            </select>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="autoApprove"
                checked={formData.autoApprove}
                onChange={handleInputChange}
              />
              Auto-post the highest-scoring variant? (skip approval)
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : '✓ Create Schedule'}
          </button>
        </form>
      )}
    </div>
  );
}
