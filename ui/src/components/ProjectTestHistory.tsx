import React, { useState, useEffect } from 'react';
import './ProjectTestHistory.css';

interface TestSummary {
  passed: number;
  total: number;
  duration: number;
}

interface TestRun {
  id: string;
  timestamp: string;
  status: string;
  testFiles: string[];
  output: string;
  summary: TestSummary;
}

interface ProjectTestHistoryProps {
  projectId: string;
}

type SortField = 'timestamp' | 'status' | 'duration';
type SortOrder = 'asc' | 'desc';

export const ProjectTestHistory: React.FC<ProjectTestHistoryProps> = ({
  projectId,
}) => {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    fetchTestHistory();
  }, [projectId]);

  const fetchTestHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3001/api/projects/${projectId}/test-history`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch test history');
      }

      setTestRuns(data.testRuns);
      setError('');
    } catch (err) {
      console.error('Error fetching test history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch test history');
      setTestRuns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sortedTestRuns = [...testRuns].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'timestamp':
        return multiplier * (new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      case 'status':
        return multiplier * a.status.localeCompare(b.status);
      case 'duration':
        return multiplier * (a.summary.duration - b.summary.duration);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="project-test-history loading">
        <div className="loading-spinner"></div>
        <p>Loading test history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-test-history error">
        <p>{error}</p>
        <button onClick={fetchTestHistory} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="project-test-history">
      <div className="history-header">
        <h3>Test Run History</h3>
        <div className="sort-controls">
          <button
            className={`sort-button ${sortField === 'timestamp' ? 'active' : ''}`}
            onClick={() => handleSort('timestamp')}
          >
            Date {sortField === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`sort-button ${sortField === 'status' ? 'active' : ''}`}
            onClick={() => handleSort('status')}
          >
            Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`sort-button ${sortField === 'duration' ? 'active' : ''}`}
            onClick={() => handleSort('duration')}
          >
            Duration {sortField === 'duration' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {testRuns.length === 0 ? (
        <p className="no-history">No test runs found for this project.</p>
      ) : (
        <div className="history-list">
          {sortedTestRuns.map((run) => (
            <div key={run.id} className={`history-item ${run.status}`}>
              <div
                className="history-item-header"
                onClick={() => setExpandedRunId(expandedRunId === run.id ? null : run.id)}
              >
                <div className="run-info">
                  <span className="timestamp">{formatDate(run.timestamp)}</span>
                  <span className={`status-badge ${run.status}`}>
                    {run.status.toUpperCase()}
                  </span>
                </div>
                <div className="run-summary">
                  <span className="summary-item">
                    Files: {run.testFiles.length}
                  </span>
                  <span className="summary-item">
                    Passed: {run.summary.passed}/{run.summary.total}
                  </span>
                  <span className="summary-item">
                    Duration: {(run.summary.duration / 1000).toFixed(2)}s
                  </span>
                </div>
                <button className="expand-button">
                  {expandedRunId === run.id ? '▼' : '▶'}
                </button>
              </div>

              {expandedRunId === run.id && (
                <div className="history-item-details">
                  <div className="test-files">
                    <h4>Test Files:</h4>
                    <ul>
                      {run.testFiles.map((file, index) => (
                        <li key={index}>{file}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="test-output">
                    <h4>Output:</h4>
                    <pre>{run.output}</pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
