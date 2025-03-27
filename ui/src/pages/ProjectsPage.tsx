import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateProjectModal } from '../components/CreateProjectModal';
import './ProjectsPage.css';

interface Project {
  id: string;
  name: string;
  description: string;
  testSite: string;
  siteAddress: string;
  version: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  testFiles: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectFormData {
  name: string;
  description: string;
  testSite: string;
  siteAddress: string;
  version: string;
}

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/projects');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch projects');
      }

      setProjects(data.projects);
      setError('');
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (projectData: ProjectFormData) => {
    try {
      const response = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create project');
      }

      // Refresh the projects list
      fetchProjects();
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'draft': return 'gray';
      case 'active': return 'green';
      case 'completed': return 'blue';
      case 'archived': return 'purple';
      default: return 'gray';
    }
  };

  if (isLoading) {
    return (
      <div className="projects-page">
        <div className="projects-page-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="projects-page-content">
        <div className="projects-page-header">
          <h1>Test Projects</h1>
          <p className="subtitle">Manage your test automation projects</p>
          <button 
            className="create-project-button"
            onClick={() => setShowCreateModal(true)}
          >
            Create New Project
          </button>
        </div>

        {error ? (
          <div className="error-message">
            {error}
            <button onClick={fetchProjects} className="retry-button">
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="projects-stats">
              <div className="stat-item">
                <span className="stat-label">Total Projects</span>
                <span className="stat-value">{projects.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active Projects</span>
                <span className="stat-value">
                  {projects.filter(p => p.status === 'active').length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completed</span>
                <span className="stat-value">
                  {projects.filter(p => p.status === 'completed').length}
                </span>
              </div>
            </div>

            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <h3>{project.name}</h3>
                    <span className={`status-badge ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="project-description">{project.description}</p>
                  <div className="project-meta">
                    <div className="meta-item">
                      <span className="meta-label">Test Site:</span>
                      <span className="meta-value">{project.testSite}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Version:</span>
                      <span className="meta-value">{project.version}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Test Files:</span>
                      <span className="meta-value">{project.testFiles.length}</span>
                    </div>
                  </div>
                  <div className="project-actions">
                    <button 
                      className="view-project-button"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}; 