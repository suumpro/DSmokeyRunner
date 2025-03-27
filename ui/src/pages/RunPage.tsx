import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './RunPage.css';

interface TestFile {
  path: string;
  type: 'unit' | 'integration';
  content?: string;
}

interface TestResult {
  output: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
  };
}

export const RunPage: React.FC = () => {
  const location = useLocation();
  const [selectedFile, setSelectedFile] = useState<TestFile | null>(null);
  const [testFiles, setTestFiles] = useState<TestFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const state = location.state as { selectedFile?: string } | null;
    if (state?.selectedFile) {
      fetchFileContent(state.selectedFile);
    }
    fetchTestFiles();
  }, [location]);

  const fetchFileContent = async (filePath: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/file-content?path=${encodeURIComponent(filePath)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch file content');
      }

      setSelectedFile({
        path: filePath,
        type: filePath.includes('/unit/') ? 'unit' : 'integration',
        content: data.content
      });
    } catch (err) {
      console.error('Error fetching file content:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch file content');
    }
  };

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

  const handleFileSelect = async (file: TestFile) => {
    await fetchFileContent(file.path);
  };

  const handleRunTest = async () => {
    if (!selectedFile) return;
    
    setIsRunning(true);
    setTestResult(null);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/run-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testFiles: [selectedFile.path] }),
      });

      // Check content type of response
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Invalid response type: ${contentType}. Expected JSON but got HTML/other content.`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to run test');
      }

      setTestResult({
        output: data.output,
        summary: {
          total: data.summary.total || 0,
          passed: data.summary.passed || 0,
          failed: data.summary.failed || 0,
          duration: data.summary.duration || 0
        }
      });
    } catch (err) {
      console.error('Error running test:', err);
      const errorMessage = err instanceof Error ? 
        err.message : 
        'Failed to run test. Please ensure the server is running and accessible.';
      setError(errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="run-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading test files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="run-page">
      <div className="run-page-content">
        <div className="run-page-header">
          <h1>Test Runner</h1>
          <p className="subtitle">View and run test files</p>
        </div>

        <div className="run-page-layout">
          <div className="test-files-panel">
            <h2>Test Files</h2>
            <div className="test-files-list">
              {testFiles.map((file) => (
                <div
                  key={file.path}
                  className={`test-file-item ${selectedFile?.path === file.path ? 'selected' : ''}`}
                  onClick={() => handleFileSelect(file)}
                >
                  <div className="file-info">
                    <span className="file-path">{file.path}</span>
                    <span className={`test-type ${file.type}`}>{file.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="test-content-panel">
            {error ? (
              <div className="error-message">
                {error}
                <button
                  onClick={() => selectedFile ? fetchFileContent(selectedFile.path) : fetchTestFiles()}
                  className="retry-button"
                >
                  Retry
                </button>
              </div>
            ) : selectedFile ? (
              <>
                <div className="test-file-header">
                  <h2>{selectedFile.path.split('/').pop()}</h2>
                  <button
                    className="run-button"
                    disabled={isRunning}
                    onClick={handleRunTest}
                  >
                    {isRunning ? 'Running...' : 'Run Test'}
                  </button>
                </div>

                <div className="test-file-content">
                  <pre><code>{selectedFile.content}</code></pre>
                </div>

                {testResult && (
                  <div className="test-results">
                    <div className="test-summary">
                      <div className="summary-item total">
                        <span>Total</span>
                        <span>{testResult.summary.total}</span>
                      </div>
                      <div className="summary-item passed">
                        <span>Passed</span>
                        <span>{testResult.summary.passed}</span>
                      </div>
                      <div className="summary-item failed">
                        <span>Failed</span>
                        <span>{testResult.summary.failed}</span>
                      </div>
                      <div className="summary-item duration">
                        <span>Duration</span>
                        <span>{testResult.summary.duration}ms</span>
                      </div>
                    </div>
                    <div className="test-output">
                      <h3>Test Output</h3>
                      <pre><code>{testResult.output}</code></pre>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="no-file-selected">
                <p>Select a test file from the list to view and run it</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
