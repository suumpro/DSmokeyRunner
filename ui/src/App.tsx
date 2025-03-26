import { useState } from 'react'
import { TestFileSelector } from './components/TestFileSelector'
import { TestRunner } from './components/TestRunner'
import { TestHistory } from './components/TestHistory'
import './App.css'

function App() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [testOutput, setTestOutput] = useState<string>('')
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'complete'>('idle')
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
    setTestStatus('complete')
    setTestOutput(result.output || '')
    
    if (result.success && result.summary) {
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
        setTestStatus('complete')
      })
      .catch(error => {
        console.error('Failed to fetch run details:', error)
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
          <div className="output-header">
            <h2>Test Output</h2>
            {testSummary && (
              <div className="test-summary">
                <div className="summary-item total">
                  Total: {testSummary.total}
                </div>
                <div className="summary-item passed">
                  Passed: {testSummary.passed}
                </div>
                <div className="summary-item failed">
                  Failed: {testSummary.failed}
                </div>
                <div className="summary-item duration">
                  Duration: {(testSummary.duration / 1000).toFixed(2)}s
                </div>
              </div>
            )}
          </div>

          <div className={`output-content ${testStatus}`}>
            {testStatus === 'running' && !testOutput && (
              <div className="loading-indicator">
                Running tests...
                <div className="loading-spinner"></div>
              </div>
            )}
            {testOutput ? (
              <pre className="test-output">{testOutput}</pre>
            ) : (
              testStatus === 'idle' && (
                <div className="empty-state">
                  Select test files and click "Run Tests" to begin
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
