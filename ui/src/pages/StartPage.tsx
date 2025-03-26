import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StartPage.css';

interface RecentFolder {
  path: string;
  lastUsed: Date;
  testCount: number;
}

export const StartPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [recentFolders, setRecentFolders] = useState<RecentFolder[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFolderSelect = async () => {
    setIsValidating(true);
    setError('');

    try {
      // TODO: Implement folder validation
      // For now, just navigate to the run page
      navigate('/run', { state: { folderPath: selectedFolder } });
    } catch (err) {
      setError('Failed to validate folder. Please ensure it contains valid test files.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRecentFolderClick = (folder: RecentFolder) => {
    setSelectedFolder(folder.path);
  };

  return (
    <div className="start-page">
      <div className="start-page-content">
        <h1>Welcome to DSmokeyRunner</h1>
        <p className="subtitle">Select a folder containing your test files to get started</p>

        <div className="folder-selection">
          <input
            type="text"
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            placeholder="Enter folder path or click 'Browse'"
            className="folder-input"
          />
          <button className="browse-button">Browse</button>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button
          className="continue-button"
          onClick={handleFolderSelect}
          disabled={!selectedFolder || isValidating}
        >
          {isValidating ? 'Validating...' : 'Continue'}
        </button>

        {recentFolders.length > 0 && (
          <div className="recent-folders">
            <h2>Recent Folders</h2>
            <ul>
              {recentFolders.map((folder) => (
                <li
                  key={folder.path}
                  onClick={() => handleRecentFolderClick(folder)}
                  className="recent-folder-item"
                >
                  <span className="folder-path">{folder.path}</span>
                  <span className="folder-info">
                    {folder.testCount} tests • Last used {new Date(folder.lastUsed).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="getting-started">
          <h2>Getting Started</h2>
          <ul>
            <li>Select a folder containing your Playwright test files</li>
            <li>Configure your test run settings</li>
            <li>View real-time test execution results</li>
            <li>Access historical test runs and analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 