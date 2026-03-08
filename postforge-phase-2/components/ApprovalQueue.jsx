/**
 * PostForge Phase 2: Approval Queue Component
 * Displays pending approvals and allows user to select variants
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ApprovalQueue() {
  const [approvals, setApprovals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    fetchApprovals();
    // Refresh every 5 minutes
    const interval = setInterval(fetchApprovals, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchApprovals = async () => {
    try {
      const res = await axios.get('/api/approvals');
      setApprovals(res.data.approvals);
      setStats(res.data.stats);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectVariant = (approvalId, variantId) => {
    setSelectedVariants({
      ...selectedVariants,
      [approvalId]: variantId
    });
  };

  const submitApproval = async (approvalId) => {
    const variantId = selectedVariants[approvalId];
    if (!variantId) {
      alert('Please select a variant');
      return;
    }

    setSubmitting({ ...submitting, [approvalId]: true });

    try {
      const res = await axios.post(`/api/approvals/${approvalId}/approve`, {
        selectedVariant: variantId,
        autoPost: true
      });

      // Remove from list
      setApprovals(approvals.filter(a => a.id !== approvalId));
      alert('✅ Approved and scheduled!');
    } catch (error) {
      alert('Error: ' + error.response?.data?.error || error.message);
    } finally {
      setSubmitting({ ...submitting, [approvalId]: false });
    }
  };

  const rejectApproval = async (approvalId) => {
    if (!confirm('Reject and regenerate new variants?')) return;

    try {
      await axios.post(`/api/approvals/${approvalId}/reject`, { regenerate: true });
      fetchApprovals(); // Refresh
      alert('✅ New variants generated!');
    } catch (error) {
      alert('Error: ' + error.response?.data?.error || error.message);
    }
  };

  const regenerateVariants = async (approvalId) => {
    try {
      await axios.post(`/api/approvals/${approvalId}/regenerate`);
      fetchApprovals(); // Refresh
      alert('✅ Variants regenerated!');
    } catch (error) {
      alert('Error: ' + error.response?.data?.error || error.message);
    }
  };

  if (loading) {
    return <div className="approval-queue loading">Loading approvals...</div>;
  }

  return (
    <div className="approval-queue">
      <h1>⏳ Pending Approvals</h1>

      {/* Stats */}
      {stats && (
        <div className="approval-stats">
          <div className="stat">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
          <div className="stat">
            <h3>{stats.oldestPendingExpiresIn || '—'}</h3>
            <p>Oldest expires in (min)</p>
          </div>
          <div className="stat">
            <h3>{stats.averageApprovalTime}</h3>
            <p>Avg approval time (min)</p>
          </div>
        </div>
      )}

      {/* Approvals List */}
      {approvals.length === 0 ? (
        <div className="empty-state">
          <p>✨ No pending approvals!</p>
          <p>Scheduled posts will appear here when it's time to review.</p>
        </div>
      ) : (
        <div className="approval-items">
          {approvals.map((approval) => (
            <div key={approval.id} className="approval-card">
              <div className="card-header">
                <h3>Approval from {new Date(approval.createdAt).toLocaleDateString()}</h3>
                <span className="expires">
                  Expires in: {Math.round((approval.expiresAt - Date.now()) / 60000)}m
                </span>
              </div>

              {/* Variants */}
              <div className="variants">
                <h4>Pick your favorite:</h4>

                {approval.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className={`variant ${selectedVariants[approval.id] === variant.id ? 'selected' : ''}`}
                    onClick={() => selectVariant(approval.id, variant.id)}
                  >
                    <div className="variant-header">
                      <span className="score">Score: {variant.score.toFixed(1)}/10</span>
                      <input
                        type="radio"
                        name={`approval-${approval.id}`}
                        checked={selectedVariants[approval.id] === variant.id}
                        onChange={() => selectVariant(approval.id, variant.id)}
                      />
                    </div>

                    <div className="variant-text">
                      <p>{variant.text}</p>
                    </div>

                    {variant.images && variant.images.length > 0 && (
                      <div className="variant-images">
                        {variant.images.map((img, idx) => (
                          <img key={idx} src={img} alt={`variant ${idx}`} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="approval-actions">
                <button
                  className="btn-primary"
                  onClick={() => submitApproval(approval.id)}
                  disabled={!selectedVariants[approval.id] || submitting[approval.id]}
                >
                  {submitting[approval.id] ? 'Approving...' : '✓ Approve & Schedule'}
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => regenerateVariants(approval.id)}
                >
                  🔄 Regenerate
                </button>

                <button
                  className="btn-danger"
                  onClick={() => rejectApproval(approval.id)}
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
