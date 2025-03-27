import { useEffect, useState } from 'react';
import axios from 'axios';
import './ProjectAnalytics.css';

interface ProjectMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageTestDuration: number;
  lastTestRun: Date | null;
  statusDurations: Record<string, number>;
  testTrends: Array<{
    date: Date;
    passed: number;
    failed: number;
    duration: number;
  }>;
}

interface ProjectAnalytics {
  projectId: string;
  metrics: ProjectMetrics;
  updatedAt: Date;
}

interface ProjectAnalyticsProps {
  projectId: string;
}

export default function ProjectAnalytics({ projectId }: ProjectAnalyticsProps) {
  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:3001/api/analytics/projects/${projectId}`);
      setAnalytics(response.data);
    } catch (err) {
      setError('Failed to fetch project analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`http://localhost:3001/api/analytics/projects/${projectId}/refresh`);
      setAnalytics(response.data);
    } catch (err) {
      setError('Failed to refresh project analytics');
      console.error('Error refreshing analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [projectId]);

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (error) {
    return <div className="analytics-error">{error}</div>;
  }

  if (!analytics) {
    return <div className="analytics-empty">No analytics available</div>;
  }

  const { metrics } = analytics;
  const passRate = metrics.totalTests > 0 
    ? ((metrics.passedTests / metrics.totalTests) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="project-analytics">
      <div className="analytics-header">
        <h2>Project Analytics</h2>
        <button onClick={refreshAnalytics} className="refresh-button">
          Refresh Analytics
        </button>
      </div>

      <div className="analytics-grid">
        <div className="metric-card">
          <h3>Test Statistics</h3>
          <div className="metric-content">
            <div className="metric-item">
              <span className="metric-label">Total Tests:</span>
              <span className="metric-value">{metrics.totalTests}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Pass Rate:</span>
              <span className="metric-value">{passRate}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Average Duration:</span>
              <span className="metric-value">{metrics.averageTestDuration.toFixed(2)}s</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <h3>Status Duration (hours)</h3>
          <div className="metric-content">
            {Object.entries(metrics.statusDurations).map(([status, duration]) => (
              <div key={status} className="metric-item">
                <span className="metric-label">{status}:</span>
                <span className="metric-value">{duration}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="metric-card">
          <h3>Last Test Run</h3>
          <div className="metric-content">
            <div className="metric-item">
              <span className="metric-label">Date:</span>
              <span className="metric-value">
                {metrics.lastTestRun 
                  ? new Date(metrics.lastTestRun).toLocaleDateString()
                  : 'Never'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-footer">
        <small>Last updated: {new Date(analytics.updatedAt).toLocaleString()}</small>
      </div>
    </div>
  );
} 