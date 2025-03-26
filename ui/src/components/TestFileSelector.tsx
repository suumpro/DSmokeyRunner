import React, { useState, useEffect } from 'react';
import './TestFileSelector.css';

interface TestFile {
  path: string;
  selected: boolean;
}

interface TestFileSelectorProps {
  onSelectionChange: (selectedFiles: string[]) => void;
}

export const TestFileSelector: React.FC<TestFileSelectorProps> = ({ onSelectionChange }) => {
  const [testFiles, setTestFiles] = useState<TestFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestFiles();
  }, []);

  const fetchTestFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/test-files');
      const data = await response.json();
      
      setTestFiles(data.testFiles.map((path: string) => ({
        path,
        selected: false
      })));
      setError(null);
    } catch (err) {
      setError('Failed to fetch test files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestFileToggle = (index: number) => {
    const updatedFiles = testFiles.map((file, i) => 
      i === index ? { ...file, selected: !file.selected } : file
    );
    setTestFiles(updatedFiles);
    
    const selectedPaths = updatedFiles
      .filter(file => file.selected)
      .map(file => file.path);
    onSelectionChange(selectedPaths);
  };

  if (loading) {
    return <div className="test-file-selector-loading">Loading test files...</div>;
  }

  if (error) {
    return (
      <div className="test-file-selector-error">
        <p>{error}</p>
        <button onClick={fetchTestFiles} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="test-file-selector">
      <h2>Test Files</h2>
      <div className="test-files-list">
        {testFiles.length === 0 ? (
          <p className="no-files-message">No test files found</p>
        ) : (
          testFiles.map((file, index) => (
            <div
              key={file.path}
              className={`test-file-item ${file.selected ? 'selected' : ''}`}
              onClick={() => handleTestFileToggle(index)}
            >
              <input
                type="checkbox"
                checked={file.selected}
                onChange={() => handleTestFileToggle(index)}
                className="test-file-checkbox"
              />
              <span className="test-file-path">{file.path}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};