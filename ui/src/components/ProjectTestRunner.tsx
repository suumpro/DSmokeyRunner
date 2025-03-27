import React, { useState } from 'react';
import './ProjectTestRunner.css';

interface TestResult {
  output: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
  };
}

interface ProjectTestRunnerProps {
  projectId: string;
  testFiles: string[];
  onTestComplete?: (result: TestResult) => void;
}

export const ProjectTestRunner: React.FC<ProjectTestRunnerProps> = ({
  projectId,
  testFiles,
  onTestComplete,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileToggle = (filePath: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filePath)) {
      newSelected.delete(filePath);
    } else {
      newSelected.add(filePath);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === testFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(testFiles));
    }
  };

  const runTests = async () => {
    if (selectedFiles.size === 0) return;

    try {
      setIsRunning(true);
      setError('');
      setCurrentResult(null);

      const response = await fetch('http://localhost:3001/api/run-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          testFiles: Array.from(selectedFiles),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to run tests');
      }

      const result: TestResult = {
        output: data.output,
        summary: {
          total: data.summary.total || 0,
          passed: data.summary.passed || 0,
          failed: data.summary.failed || 0,
          duration: data.summary.duration || 0,
        },
      };

      setCurrentResult(result);
      onTestComplete?.(result);
    } catch (err) {
      console.error('Error running tests:', err);
      setError(err instanceof Error ? err.message : 'Failed to run tests');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="project-test-runner">
      <div className="test-files-section">
        <div className="section-header">
          <h3>Select Test Files to Run</h3>
          <button
            className="select-all-button"
            onClick={handleSelectAll}
          >
            {selectedFiles.size === testFiles.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="test-files-list">
          {testFiles.map((file) => (
            <div
              key={file}
              className={`test-file-item ${selectedFiles.has(file) ? 'selected' : ''}`}
              onClick={() => handleFileToggle(file)}
            >
              <input
                type="checkbox"
                checked={selectedFiles.has(file)}
                onChange={() => handleFileToggle(file)}
                className="test-file-checkbox"
              />
              <span className="test-file-path">{file}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="test-execution-section">
        <button
          className={`run-button ${isRunning ? 'running' : ''}`}
          onClick={runTests}
          disabled={isRunning || selectedFiles.size === 0}
        >
          {isRunning ? (
            <>
              <span className="spinner"></span>
              Running Tests...
            </>
          ) : (
            <>
              <span className="run-icon">▶</span>
              Run Selected Tests
            </>
          )}
        </button>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {currentResult && (
          <div className="test-results">
            <div className="results-summary">
              <div className="summary-item total">
                Total: {currentResult.summary.total}
              </div>
              <div className="summary-item passed">
                Passed: {currentResult.summary.passed}
              </div>
              <div className="summary-item failed">
                Failed: {currentResult.summary.failed}
              </div>
              <div className="summary-item duration">
                Duration: {(currentResult.summary.duration / 1000).toFixed(2)}s
              </div>
            </div>
            <div className="results-output">
              <h4>Test Output</h4>
              <pre>{currentResult.output}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 