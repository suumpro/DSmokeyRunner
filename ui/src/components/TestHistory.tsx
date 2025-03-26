import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import './TestHistory.css';

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  duration: number;
}

interface HistoryEntry {
  runId: string;
  timestamp: string;
  testFiles: string[];
  status: 'passed' | 'failed' | 'error';
  summary: TestSummary;
  output: string;
}

interface TestHistoryProps {
  onSelectRun?: (runId: string) => void;
}

export const TestHistory: React.FC<TestHistoryProps> = ({ onSelectRun }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/history');
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setHistory(data.entries);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/history/clear', {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to clear history');
      fetchHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear history');
    }
  };

  const handleDeleteEntry = async (runId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/history/${runId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete entry');
      fetchHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
    }
  };

  if (loading) {
    return <div className="test-history loading">Loading history...</div>;
  }

  if (error) {
    return (
      <div className="test-history error">
        <p>Error: {error}</p>
        <button onClick={fetchHistory}>Retry</button>
      </div>
    );
  }

  return (
    <div className="test-history">
      <div className="test-history-header">
        <h2>Test Run History</h2>
        <button 
          onClick={handleClearHistory}
          className="clear-history-button"
          disabled={history.length === 0}
        >
          Clear History
        </button>
      </div>

      {history.length === 0 ? (
        <p className="no-history">No test runs recorded yet.</p>
      ) : (
        <div className="history-entries">
          {history.map((entry) => (
            <div 
              key={entry.runId}
              className={`history-entry ${entry.status}`}
              onClick={() => onSelectRun?.(entry.runId)}
            >
              <div className="entry-header">
                <div className="entry-info">
                  <span className="timestamp">
                    {dayjs(entry.timestamp).format('MMM D, YYYY HH:mm:ss')}
                  </span>
                  <span className={`status ${entry.status}`}>
                    {entry.status.toUpperCase()}
                  </span>
                </div>
                <div className="entry-summary">
                  <span className="files-count">
                    {entry.testFiles.length} file{entry.testFiles.length !== 1 ? 's' : ''}
                  </span>
                  <span className="test-count">
                    {entry.summary.passed}/{entry.summary.total} passed
                  </span>
                  <span className="duration">
                    {(entry.summary.duration / 1000).toFixed(1)}s
                  </span>
                </div>
              </div>

              <button
                className="expand-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedRunId(expandedRunId === entry.runId ? null : entry.runId);
                }}
              >
                {expandedRunId === entry.runId ? 'Hide Details' : 'Show Details'}
              </button>

              {expandedRunId === entry.runId && (
                <div className="entry-details">
                  <div className="test-files">
                    <h4>Test Files:</h4>
                    <ul>
                      {entry.testFiles.map((file, index) => (
                        <li key={index}>{file}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="test-output">
                    <h4>Output:</h4>
                    <pre>{entry.output}</pre>
                  </div>
                  <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEntry(entry.runId);
                    }}
                  >
                    Delete Entry
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 