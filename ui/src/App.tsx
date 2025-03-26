import { useState } from 'react'
import { TestFileSelector } from './components/TestFileSelector'
import { TestRunner } from './components/TestRunner'
import { TestHistory } from './components/TestHistory'
import './App.css'

function App() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [testOutput, setTestOutput] = useState<string>('')
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'complete' | 'error'>('idle')
  const [testSummary, setTestSummary] = useState<{
    total: number;
    passed: number;
    failed: number;
    duration: number;
  } | null>(null)
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

  const handleTestStart = () => {
    setTestStatus('running')
    setTestOutput('')
    setTestSummary(null)
    setSelectedRunId(null)
  }

  const handleTestComplete = (result: any) => {
    setTestStatus(result.success ? 'complete' : 'error')
    setTestOutput(result.output || '')
    
    if (result.summary) {
      setTestSummary(result.summary)
    }

    if (result.runId) {
      setSelectedRunId(result.runId)
    }
  }

  const handleRunSelect = (runId: string) => {
    setSelectedRunId(runId)
    // Fetch and display the selected run's details
    fetch(`http://localhost:3001/api/history/${runId}`)
      .then(response => response.json())
      .then(entry => {
        setTestOutput(entry.output || '')
        setTestSummary(entry.summary)
        setSelectedFiles(entry.testFiles)
        setTestStatus(entry.status === 'passed' ? 'complete' : 'error')
      })
      .catch(error => {
        console.error('Failed to fetch run details:', error)
        setTestStatus('error')
      })
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>DSmokey Runner</h1>
        <p className="subtitle">Playwright Test Runner</p>
      </header>

      <main className="app-main">
        <div className="left-panel">
          <div className="control-panel">
            <TestFileSelector onSelectionChange={setSelectedFiles} />
            <TestRunner
              selectedFiles={selectedFiles}
              onTestStart={handleTestStart}
              onTestComplete={handleTestComplete}
            />
          </div>
          <TestHistory onSelectRun={handleRunSelect} />
        </div>

        <div className="output-panel">
          <div className={`output-header ${testStatus}`}>
            <h2>Test Output</h2>
            {testSummary && (
              <div className="test-summary">
                <div className="summary-item total">
                  <span className="summary-label">Total Tests</span>
                  <span className="summary-value">{testSummary.total}</span>
                </div>
                <div className="summary-item passed">
                  <span className="summary-label">Passed</span>
                  <span className="summary-value">{testSummary.passed}</span>
                </div>
                <div className="summary-item failed">
                  <span className="summary-label">Failed</span>
                  <span className="summary-value">{testSummary.failed}</span>
                </div>
                <div className="summary-item duration">
                  <span className="summary-label">Duration</span>
                  <span className="summary-value">{(testSummary.duration / 1000).toFixed(2)}s</span>
                </div>
              </div>
            )}
          </div>

          <div className={`output-content ${testStatus}`}>
            {testStatus === 'running' && (
              <div className="loading-indicator">
                <div className="loading-spinner"></div>
                <p>Running tests...</p>
                <p className="loading-subtitle">This may take a few moments</p>
              </div>
            )}
            {testOutput ? (
              <div className="output-wrapper">
                <pre className="test-output">{testOutput}</pre>
                {testStatus === 'complete' && (
                  <div className="success-indicator">
                    <span className="success-icon">✓</span>
                    <span>All tests completed successfully</span>
                  </div>
                )}
                {testStatus === 'error' && (
                  <div className="error-indicator">
                    <span className="error-icon">⚠</span>
                    <span>Some tests failed or encountered errors</span>
                  </div>
                )}
              </div>
            ) : (
              testStatus === 'idle' && (
                <div className="empty-state">
                  <span className="empty-icon">📋</span>
                  <p>Select test files and click "Run Tests" to begin</p>
                  <p className="empty-subtitle">Your test results will appear here</p>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
