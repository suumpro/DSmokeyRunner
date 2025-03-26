import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TestFileSelector } from '../components/TestFileSelector';
import { TestRunner } from '../components/TestRunner';
import './RunPage.css';

interface LocationState {
  folderPath: string;
}

export const RunPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [testOutput, setTestOutput] = useState<string>('');
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'complete' | 'error'>('idle');
  const [testSummary, setTestSummary] = useState<{
    total: number;
    passed: number;
    failed: number;
    duration: number;
  } | null>(null);

  const state = location.state as LocationState;

  useEffect(() => {
    if (!state?.folderPath) {
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  const handleTestStart = () => {
    setTestStatus('running');
    setTestOutput('');
    setTestSummary(null);
  };

  const handleTestComplete = (
    output: string,
    summary: { total: number; passed: number; failed: number; duration: number }
  ) => {
    setTestOutput(output);
    setTestSummary(summary);
    setTestStatus(summary.failed > 0 ? 'error' : 'complete');
  };

  if (!state?.folderPath) {
    return null;
  }

  return (
    <div className="run-page">
      <header className="run-page-header">
        <h1>Test Runner</h1>
        <div className="folder-info">
          <span className="label">Test Folder:</span>
          <span className="value">{state.folderPath}</span>
        </div>
      </header>

      <div className="run-page-content">
        <div className="control-panel">
          <TestFileSelector
            folderPath={state.folderPath}
            onFilesSelected={setSelectedFiles}
          />
          <TestRunner
            selectedFiles={selectedFiles}
            onTestStart={handleTestStart}
            onTestComplete={handleTestComplete}
          />
        </div>

        <div className="output-panel">
          <div className="output-header">
            <h2>Test Output</h2>
            {testStatus === 'running' && (
              <div className="status running">Running tests...</div>
            )}
            {testStatus === 'complete' && (
              <div className="status success">Tests completed successfully</div>
            )}
            {testStatus === 'error' && (
              <div className="status error">Some tests failed</div>
            )}
          </div>

          {testSummary && (
            <div className="test-summary">
              <div className="summary-item total">
                <span className="label">Total Tests:</span>
                <span className="value">{testSummary.total}</span>
              </div>
              <div className="summary-item passed">
                <span className="label">Passed:</span>
                <span className="value">{testSummary.passed}</span>
              </div>
              <div className="summary-item failed">
                <span className="label">Failed:</span>
                <span className="value">{testSummary.failed}</span>
              </div>
              <div className="summary-item duration">
                <span className="label">Duration:</span>
                <span className="value">{(testSummary.duration / 1000).toFixed(2)}s</span>
              </div>
            </div>
          )}

          <div className="output-content">
            {testOutput ? (
              <pre>{testOutput}</pre>
            ) : (
              <div className="empty-output">
                Select test files and click "Run Tests" to begin
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 