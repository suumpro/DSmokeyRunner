import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StatusHistory.css';

interface StatusTransition {
  from: string;
  to: string;
  timestamp: string;
  reason?: string;
}

interface StatusHistoryProps {
  projectId: string;
}

export const StatusHistory: React.FC<StatusHistoryProps> = ({ projectId }) => {
  const [history, setHistory] = useState<StatusTransition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatusHistory();
  }, [projectId]);

  const fetchStatusHistory = async () => {
    try {
      const response = await axios.get<StatusTransition[]>(
        `http://localhost:3001/api/projects/${projectId}/status-history`
      );
      setHistory(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching status history:', error);
      setError('Failed to load status history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return <div className="status-history-loading">Loading history...</div>;
  }

  if (error) {
    return <div className="status-history-error">{error}</div>;
  }

  if (history.length === 0) {
    return <div className="status-history-empty">No status changes yet</div>;
  }

  return (
    <div className="status-history">
      <h3>Status History</h3>
      <div className="status-timeline">
        {history.map((transition, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-connector">
              <div className="timeline-dot" />
              {index < history.length - 1 && <div className="timeline-line" />}
            </div>
            <div className="timeline-content">
              <div className="transition-header">
                <span className="transition-status">
                  {transition.from} → {transition.to}
                </span>
                <span className="transition-date">
                  {formatDate(transition.timestamp)}
                </span>
              </div>
              {transition.reason && (
                <div className="transition-reason">{transition.reason}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
