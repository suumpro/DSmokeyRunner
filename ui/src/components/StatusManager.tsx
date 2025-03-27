import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StatusManager.css';

type ProjectStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

interface StatusManagerProps {
  projectId: string;
  currentStatus: ProjectStatus;
  onStatusChange: (status: ProjectStatus) => void;
}

interface StatusColors {
  [key: string]: string;
  draft: string;
  active: string;
  paused: string;
  completed: string;
  archived: string;
}

export const StatusManager: React.FC<StatusManagerProps> = ({
  projectId,
  currentStatus,
  onStatusChange,
}) => {
  const [availableTransitions, setAvailableTransitions] = useState<ProjectStatus[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchAvailableTransitions();
  }, [projectId, currentStatus]);

  const fetchAvailableTransitions = async () => {
    try {
      const response = await axios.get<ProjectStatus[]>(
        `http://localhost:3001/api/projects/${projectId}/available-status-transitions`
      );
      setAvailableTransitions(response.data);
    } catch (error) {
      console.error('Error fetching available transitions:', error);
      setError('Failed to load available status transitions');
    }
  };

  const handleStatusClick = (status: ProjectStatus) => {
    setSelectedStatus(status);
    setShowReasonModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;

    setIsUpdating(true);
    setError(null);

    try {
      const response = await axios.patch<{ status: ProjectStatus }>(
        `http://localhost:3001/api/projects/${projectId}/status`,
        {
          status: selectedStatus,
          reason: reason.trim() || undefined,
        }
      );
      onStatusChange(response.data.status);
      setShowReasonModal(false);
      setReason('');
      setSelectedStatus(null);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: ProjectStatus): string => {
    const colors: StatusColors = {
      draft: 'gray',
      active: 'green',
      paused: 'orange',
      completed: 'blue',
      archived: 'purple',
    };
    return colors[status] || 'gray';
  };

  return (
    <div className="status-manager">
      <div className="current-status">
        <span className="status-label">Current Status:</span>
        <span className={`status-badge ${getStatusColor(currentStatus)}`}>
          {currentStatus}
        </span>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="available-transitions">
        {availableTransitions.map((status) => (
          <button
            key={status}
            className={`status-button ${getStatusColor(status)}`}
            onClick={() => handleStatusClick(status)}
            disabled={isUpdating}
          >
            {status}
          </button>
        ))}
      </div>

      {showReasonModal && (
        <div className="reason-modal">
          <div className="reason-modal-content">
            <h3>Update Status</h3>
            <p>
              Are you sure you want to change the status from{' '}
              <strong>{currentStatus}</strong> to{' '}
              <strong>{selectedStatus}</strong>?
            </p>
            <textarea
              placeholder="Enter a reason for this status change (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => {
                  setShowReasonModal(false);
                  setReason('');
                  setSelectedStatus(null);
                }}
              >
                Cancel
              </button>
              <button
                className="confirm-button"
                onClick={handleStatusUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
