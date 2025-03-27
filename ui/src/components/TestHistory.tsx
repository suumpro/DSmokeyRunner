import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import './TestHistory.css';

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  duration: number;
}

interface TestHistoryEntry {
  runId: string;
  timestamp: string;
  status: 'passed' | 'failed' | 'error';
  testFiles: string[];
  output: string;
  summary: TestSummary;
}

interface TestHistoryProps {
  onSelectRun?: (runId: string) => void;
}

export const TestHistory: React.FC<TestHistoryProps> = ({ onSelectRun }) => {
  const [history, setHistory] = useState<TestHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'date' | 'status' | 'files' | 'passed' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed' | 'error'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSort = (field: typeof sortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedHistory = useMemo(() => {
    let result = [...history];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(entry => entry.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(entry => 
        entry.testFiles.some(file => file.toLowerCase().includes(query)) ||
        entry.output.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'date':
          return multiplier * (new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        case 'status':
          return multiplier * a.status.localeCompare(b.status);
        case 'files':
          return multiplier * (a.testFiles.length - b.testFiles.length);
        case 'passed':
          return multiplier * ((a.summary.passed / a.summary.total) - (b.summary.passed / b.summary.total));
        case 'duration':
          return multiplier * (a.summary.duration - b.summary.duration);
        default:
          return 0;
      }
    });

    return result;
  }, [history, sortField, sortOrder, statusFilter, searchQuery]);

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
        <div className="history-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search in files or output..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="error">Error</option>
          </select>
          <button
            onClick={handleClearHistory}
            className="clear-history-button"
            disabled={history.length === 0}
          >
            Clear History
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <p className="no-history">No test runs recorded yet.</p>
      ) : (
        <div className="history-table">
          <div className="history-table-header">
            <div
              className={`header-cell date ${sortField === 'date' ? sortOrder : ''}`}
              onClick={() => handleSort('date')}
            >
              Date/Time
            </div>
            <div
              className={`header-cell status ${sortField === 'status' ? sortOrder : ''}`}
              onClick={() => handleSort('status')}
            >
              Status
            </div>
            <div
              className={`header-cell files ${sortField === 'files' ? sortOrder : ''}`}
              onClick={() => handleSort('files')}
            >
              Files
            </div>
            <div
              className={`header-cell passed ${sortField === 'passed' ? sortOrder : ''}`}
              onClick={() => handleSort('passed')}
            >
              Pass Rate
            </div>
            <div
              className={`header-cell duration ${sortField === 'duration' ? sortOrder : ''}`}
              onClick={() => handleSort('duration')}
            >
              Duration
            </div>
            <div className="header-cell actions">Actions</div>
          </div>

          <div className="history-table-body">
            {filteredAndSortedHistory.map((entry) => (
              <div
                key={entry.runId}
                className={`history-row ${entry.status}`}
                onClick={() => onSelectRun?.(entry.runId)}
              >
                <div className="cell date">
                  {dayjs(entry.timestamp).format('MMM D, YYYY HH:mm:ss')}
                </div>
                <div className={`cell status ${entry.status}`}>
                  {entry.status.toUpperCase()}
                </div>
                <div className="cell files">
                  {entry.testFiles.length} file{entry.testFiles.length !== 1 ? 's' : ''}
                </div>
                <div className="cell passed">
                  {((entry.summary.passed / entry.summary.total) * 100).toFixed(1)}%
                </div>
                <div className="cell duration">
                  {entry.summary.duration}ms
                </div>
                <div className="cell actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEntry(entry.runId);
                    }}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
