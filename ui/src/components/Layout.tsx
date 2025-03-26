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
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/">DSmokeyRunner</Link>
        </div>
        <ul className="nav-links">
          <li>
            <Link 
              to="/" 
              className={isActive('/') ? 'active' : ''}
            >
              Test Files
            </Link>
          </li>
          <li>
            <Link 
              to="/run" 
              className={isActive('/run') ? 'active' : ''}
            >
              Run Tests
            </Link>
          </li>
          <li>
            <Link 
              to="/history" 
              className={isActive('/history') ? 'active' : ''}
            >
              History
            </Link>
          </li>
        </ul>
      </nav>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>DSmokeyRunner - A Playwright-based test runner</p>
      </footer>
    </div>
  );
}; 