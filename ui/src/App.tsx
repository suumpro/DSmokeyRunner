import { useState, useEffect, useRef } from 'react'
import './App.css'

interface TestFile {
  path: string;
  selected: boolean;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  duration: number;
}

function App() {
  const [testFiles, setTestFiles] = useState<TestFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [testOutput, setTestOutput] = useState<string>('')
  const [testSummary, setTestSummary] = useState<TestSummary | null>(null)
  const outputEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchTestFiles()
  }, [])

  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [testOutput])

  const fetchTestFiles = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('http://localhost:3001/api/test-files')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch test files')
      }

      setTestFiles(data.testFiles.map((path: string) => ({ path, selected: false })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch test files')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTestFile = (index: number) => {
    setTestFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, selected: !file.selected } : file
    ))
  }

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  const runTests = async () => {
    const selectedFiles = testFiles.filter(file => file.selected).map(file => file.path)
    
    if (selectedFiles.length === 0) {
      setError('Please select at least one test file')
      return
    }

    try {
      setRunStatus('running')
      setError(null)
      setTestOutput('')
      setTestSummary(null)
      
      console.log('%c🚀 Starting test run', 'font-weight: bold; color: #6366f1;', {
        selectedFiles,
        currentState: {
          runStatus,
          testOutputLength: testOutput.length,
          hasError: !!error
        }
      })
      
      const response = await fetch('http://localhost:3001/api/run-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targets: selectedFiles }),
      })

      const data = await response.json()
      
      // Log raw response data first
      console.log('%c📦 Raw API Response', 'font-weight: bold; color: #8b5cf6;', 
        JSON.stringify(data, null, 2)
      )

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run tests')
      }

      // Detailed output inspection
      console.group('%c🔍 Output Inspection', 'font-weight: bold; color: #06b6d4;')
      console.log('Output type:', typeof data.output)
      console.log('Output value:', data.output)
      console.log('Output length:', data.output?.length)
      console.log('Is output empty:', !data.output)
      console.log('Is output undefined:', data.output === undefined)
      console.log('Is output null:', data.output === null)
      console.groupEnd()

      // Always ensure we have a string output
      const outputToSet = data.output || ''
      console.log('%c💾 About to set test output', 'font-weight: bold; color: #84cc16;', {
        outputToSet,
        length: outputToSet.length,
        isString: typeof outputToSet === 'string'
      })

      // Set states in order
      setTestOutput(outputToSet)
      setTestSummary(data.summary || null)
      setRunStatus(data.success ? 'success' : 'error')

    } catch (err) {
      console.error('%c❌ Test run error', 'font-weight: bold; color: #ef4444;', {
        error: err,
        message: err instanceof Error ? err.message : 'Failed to run tests',
        state: { runStatus, testOutput: testOutput.length }
      })
      setError(err instanceof Error ? err.message : 'Failed to run tests')
      setRunStatus('error')
    }
  }

  useEffect(() => {
    const timestamp = new Date().toISOString()
    console.log('%c📝 State Update', 'font-weight: bold; color: #84cc16;', {
      timestamp,
      testOutput: {
        length: testOutput.length,
        preview: testOutput.substring(0, 100),
        isEmpty: testOutput === ''
      },
      runStatus,
      error,
      renderCount: debugRenderCount.current++
    })
  }, [testOutput, runStatus, error])

  const debugRenderCount = useRef(0)
  const selectedCount = testFiles.filter(f => f.selected).length

  const debugInfo = {
    timestamp: new Date().toISOString(),
    renderCount: debugRenderCount.current,
    runStatus,
    testOutput: {
      exists: !!testOutput,
      length: testOutput.length,
      preview: testOutput.substring(0, 50) + '...'
    },
    summary: testSummary,
    error,
    isLoading,
    selectedFiles: selectedCount
  }

  useEffect(() => {
    console.log('%c🔍 Render State', 'font-weight: bold; color: #f59e0b;', debugInfo)
  }, [
    runStatus,
    testOutput.length,
    !!testSummary,
    !!error,
    isLoading,
    selectedCount
  ])

  const DebugPanel = () => (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: '#1e1e1e',
      color: '#e0e0e0',
      padding: '10px',
      borderRadius: '4px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 1000,
      maxWidth: '400px',
      maxHeight: '400px',
      overflow: 'auto',
      border: '1px solid #3d3d3d',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    }}>
      <div style={{ marginBottom: '8px', borderBottom: '1px solid #3d3d3d', paddingBottom: '4px' }}>
        Debug Info (Render #{debugRenderCount.current})
      </div>
      <pre style={{ margin: 0 }}>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  )

  // Add output display debugging
  const TestOutput = () => {
    console.log('%c📺 Rendering test output', 'font-weight: bold; color: #f59e0b;', {
      outputLength: testOutput.length,
      hasOutput: !!testOutput,
      runStatus,
      actualOutput: testOutput
    })

    return (
      <div className="test-output" role="log" aria-label="Test Output">
        <div className="output-header">
          <h3>Test Output</h3>
          <div className="debug-status">
            Status: {runStatus} | Output Length: {testOutput.length}
          </div>
        </div>
        <pre className="output-content" style={{ 
          border: '1px solid #3d3d3d',
          minHeight: '200px',
          padding: '1rem',
          margin: 0,
          backgroundColor: '#1a1a1a',
          color: '#e0e0e0',
          fontFamily: 'Monaco, monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowX: 'auto'
        }}>
          {testOutput || 'No output yet...'}
          <div ref={outputEndRef} />
        </pre>
      </div>
    )
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>
          <span className="app-logo">🎭</span>
          DSmokey Runner
        </h1>
      </header>

      <main className="main-content">
        <div className="app-layout">
          <aside className="sidebar">
            <section className="test-explorer" aria-label="Test Explorer">
              <div className="section-header">
                <h2>Test Explorer</h2>
                <button 
                  onClick={fetchTestFiles} 
                  disabled={isLoading || runStatus === 'running'}
                  className="secondary-button"
                  aria-label="Refresh test files"
                  title="Refresh test files list"
                >
                  <span className="button-icon">🔄</span>
                  Refresh
                </button>
              </div>

              <div className="test-files" role="region" aria-label="Test Files">
                {isLoading ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading test files...</p>
                  </div>
                ) : testFiles.length === 0 ? (
                  <div className="empty-state">
                    <p>No test files found in the project.</p>
                    <p className="hint-text">Try refreshing or checking your test directory.</p>
                  </div>
                ) : (
                  <>
                    <div className="list-header">
                      <span>{testFiles.length} files found</span>
                      <span>{selectedCount} selected</span>
                    </div>
                    <ul className="file-list">
                      {testFiles.map((file, index) => (
                        <li key={file.path} className={file.selected ? 'selected' : ''}>
                          <label className="file-item">
                            <input
                              type="checkbox"
                              checked={file.selected}
                              onChange={() => toggleTestFile(index)}
                              aria-label={`Select ${file.path}`}
                            />
                            <span className="file-icon">📄</span>
                            <span className="file-path">{file.path}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </section>
          </aside>

          <div className="main-panel">
            <section className="test-actions" aria-label="Test Actions">
              <button 
                onClick={runTests} 
                disabled={isLoading || runStatus === 'running' || selectedCount === 0}
                className="primary-button run-button"
              >
                {runStatus === 'running' ? (
                  <>
                    <span className="spinner-small"></span>
                    Running Tests...
                  </>
                ) : (
                  <>
                    <span className="button-icon">▶️</span>
                    Run Selected Tests
                  </>
                )}
              </button>

              {error && (
                <div className="error-message" role="alert">
                  <span className="message-icon">⚠️</span>
                  {error}
                </div>
              )}

              {testSummary && (
                <div className={`test-summary ${runStatus}`} role="status">
                  <h3>Test Summary</h3>
                  <div className="summary-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total Tests:</span>
                      <span className="stat-value">{testSummary.total}</span>
                    </div>
                    <div className="stat-item success">
                      <span className="stat-label">Passed:</span>
                      <span className="stat-value">{testSummary.passed}</span>
                    </div>
                    <div className="stat-item error">
                      <span className="stat-label">Failed:</span>
                      <span className="stat-value">{testSummary.failed}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Duration:</span>
                      <span className="stat-value">{formatDuration(testSummary.duration)}</span>
                    </div>
                  </div>
                </div>
              )}

              <TestOutput />
            </section>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p className="hint-text">Tip: Select multiple files to run them together</p>
      </footer>
      <DebugPanel />
    </div>
  )
}

export default App
