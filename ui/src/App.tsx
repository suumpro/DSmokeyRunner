import { useState, useEffect } from 'react'
import './App.css'

interface TestFile {
  path: string;
  selected: boolean;
}

function App() {
  const [testFiles, setTestFiles] = useState<TestFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')

  // Fetch test files on component mount
  useEffect(() => {
    fetchTestFiles()
  }, [])

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

  const runTests = async () => {
    const selectedFiles = testFiles.filter(file => file.selected).map(file => file.path)
    
    if (selectedFiles.length === 0) {
      setError('Please select at least one test file')
      return
    }

    try {
      setRunStatus('running')
      setError(null)
      
      const response = await fetch('http://localhost:3001/api/run-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targets: selectedFiles }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to run tests')
      }

      setRunStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run tests')
      setRunStatus('error')
    }
  }

  return (
    <div className="container">
      <h1>DSmokey Runner</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="test-files">
        <h2>Test Files</h2>
        {isLoading ? (
          <p>Loading test files...</p>
        ) : testFiles.length === 0 ? (
          <p>No test files found</p>
        ) : (
          <ul>
            {testFiles.map((file, index) => (
              <li key={file.path}>
                <label>
                  <input
                    type="checkbox"
                    checked={file.selected}
                    onChange={() => toggleTestFile(index)}
                  />
                  {file.path}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="actions">
        <button 
          onClick={runTests} 
          disabled={isLoading || runStatus === 'running' || testFiles.filter(f => f.selected).length === 0}
        >
          {runStatus === 'running' ? 'Running Tests...' : 'Run Selected Tests'}
        </button>
        <button onClick={fetchTestFiles} disabled={isLoading || runStatus === 'running'}>
          Refresh Test Files
        </button>
      </div>

      {runStatus === 'success' && (
        <div className="success-message">
          Tests completed successfully!
        </div>
      )}
    </div>
  )
}

export default App
