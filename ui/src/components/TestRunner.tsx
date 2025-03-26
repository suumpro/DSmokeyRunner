import React, { useState } from 'react';
import './TestRunner.css';

interface TestRunnerProps {
  selectedFiles: string[];
  onTestStart: () => void;
  onTestComplete: (result: any) => void;
}

export const TestRunner: React.FC<TestRunnerProps> = ({
  selectedFiles,
  onTestStart,
  onTestComplete,
}) => {
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    if (selectedFiles.length === 0) {
      return;
    }

    try {
      setIsRunning(true);
      onTestStart();

      const response = await fetch('http://localhost:3001/api/run-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testFiles: selectedFiles }),
      });

      const result = await response.json();
      onTestComplete(result);
    } catch (error) {
      onTestComplete({
        success: false,
        error: 'Failed to run tests. Please try again.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="test-runner">
      <button
        className={`run-button ${isRunning ? 'running' : ''} ${
          selectedFiles.length === 0 ? 'disabled' : ''
        }`}
        onClick={runTests}
        disabled={isRunning || selectedFiles.length === 0}
      >
        {isRunning ? (
          <>
            <span className="spinner"></span>
            Running Tests...
          </>
        ) : (
          <>
            <span className="run-icon">▶</span>
            Run Tests
          </>
        )}
      </button>
      
      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <span className="selected-count">
            {selectedFiles.length} test{selectedFiles.length !== 1 ? 's' : ''} selected
          </span>
        </div>
      )}
    </div>
  );
};