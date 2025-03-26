import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="layout">
      <nav className="nav">
        <div className="nav-content">
          <div className="nav-brand">
            <Link to="/" className="brand-link">
              DSmokeyRunner
            </Link>
          </div>
          <div className="nav-links">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Start
            </Link>
            <Link
              to="/run"
              className={`nav-link ${isActive('/run') ? 'active' : ''}`}
            >
              Run Tests
            </Link>
            <Link
              to="/history"
              className={`nav-link ${isActive('/history') ? 'active' : ''}`}
            >
              History
            </Link>
          </div>
          <div className="nav-actions">
            <button className="theme-toggle">
              🌙
            </button>
            <button className="help-button">
              ?
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>DSmokeyRunner © 2024</p>
          <div className="footer-links">
            <a href="#" className="footer-link">Documentation</a>
            <a href="#" className="footer-link">GitHub</a>
            <a href="#" className="footer-link">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}; 