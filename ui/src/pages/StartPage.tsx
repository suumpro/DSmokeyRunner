import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StartPage.css';

interface TestFile {
  path: string;
  type: string;  // 'unit' | 'integration'
}

const RECENT_FOLDERS_KEY = 'dsmokey_recent_folders';

export const StartPage: React.FC = () => {
  const navigate = useNavigate();
  const [testFiles, setTestFiles] = useState<TestFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchTestFiles();
  }, []);

  const fetchTestFiles = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/test-files');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch test files');
      }

      if (!data.testFiles || !Array.isArray(data.testFiles)) {
        throw new Error('Invalid response format from server');
      }

      // Convert file paths to TestFile objects
      const files = data.testFiles.map((path: string) => ({
        path,
        type: path.includes('/unit/') ? 'unit' : 'integration'
      }));

      setTestFiles(files);
      setError('');
    } catch (err) {
      console.error('Error fetching test files:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch test files');
      setTestFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="start-page">
        <div className="start-page-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading test files...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="start-page">
      <div className="start-page-content">
        <h1>Available Test Files</h1>
        <p className="subtitle">Overview of all test files in the project</p>

        {error ? (
          <div className="error-message">
            {error}
            <button onClick={fetchTestFiles} className="retry-button">
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="test-files-stats">
              <div className="stat-item">
                <span className="stat-label">Total Tests</span>
                <span className="stat-value">{testFiles.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Unit Tests</span>
                <span className="stat-value">
                  {testFiles.filter(f => f.type === 'unit').length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Integration Tests</span>
                <span className="stat-value">
                  {testFiles.filter(f => f.type === 'integration').length}
                </span>
              </div>
            </div>

            <div className="test-files-table">
              <table>
                <thead>
                  <tr>
                    <th>Test File</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testFiles.map((file) => (
                    <tr key={file.path}>
                      <td className="file-path">{file.path}</td>
                      <td className={`test-type ${file.type}`}>
                        {file.type}
                      </td>
                      <td>
                        <button 
                          className="view-file-button"
                          onClick={() => navigate('/run', { 
                            state: { selectedFile: file.path },
                            replace: false 
                          })}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="getting-started">
          <h2>Getting Started</h2>
          <ul>
            <li>View available test files above</li>
            <li>Click "Run Tests" in the navigation to execute tests</li>
            <li>View real-time test execution results</li>
            <li>Access historical test runs in History</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 