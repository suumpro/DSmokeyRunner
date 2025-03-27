"use strict";
import React from 'react';
import { TestHistory } from '../components/TestHistory';
import './HistoryPage.css';

export const HistoryPage: React.FC = () => {
  return (
    <div className="history-page">
      <header className="history-page-header">
        <h1>Test History</h1>
        <p className="subtitle">View and analyze your test execution history</p>
      </header>

      <div className="history-page-content">
        <div className="history-controls">
          <div className="view-options">
            <button className="view-option active">Table View</button>
            <button className="view-option">Calendar View</button>
            <button className="view-option">Analytics</button>
          </div>
        </div>

        <div className="history-container">
          <TestHistory />
        </div>
      </div>
    </div>
  );
};
