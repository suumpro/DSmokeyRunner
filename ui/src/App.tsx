"use strict";
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StartPage } from './pages/StartPage';
import { RunPage } from './pages/RunPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<StartPage />} />
            <Route path="/run" element={<RunPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          </Routes>
        </ErrorBoundary>
      </Layout>
    </Router>
  );
};

export default App;
