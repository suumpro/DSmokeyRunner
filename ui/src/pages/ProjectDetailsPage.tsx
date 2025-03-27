import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditProjectModal } from '../components/EditProjectModal';
import { TestFileSelector } from '../components/TestFileSelector';
import { ProjectTestRunner } from '../components/ProjectTestRunner';
import { ProjectTestHistory } from '../components/ProjectTestHistory';
import './ProjectDetailsPage.css';

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

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showTestFileSelector, setShowTestFileSelector] = useState(false);
  const [isUpdatingTestFiles, setIsUpdatingTestFiles] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch project details');
      }

      setProject(data.project);
      setError('');
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch project details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: Project['status']) => {
    if (!project || isUpdatingStatus) return;

    try {
      setIsUpdatingStatus(true);
      const response = await fetch(`http://localhost:3001/api/projects/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update project status');
      }

      setProject(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      console.error('Error updating project status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update project status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete project');
      }

      navigate('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleProjectUpdate = async (projectData: ProjectFormData) => {
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update project');
      }

      // Refresh project details
      fetchProjectDetails();
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to update project');
    }
  };

  const handleAddTestFiles = async (selectedFiles: string[]) => {
    if (!project || isUpdatingTestFiles) return;

    try {
      setIsUpdatingTestFiles(true);
      const response = await fetch(`http://localhost:3001/api/projects/${id}/test-files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testFiles: selectedFiles }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add test files');
      }

      // Refresh project details to get updated test files
      fetchProjectDetails();
      setShowTestFileSelector(false);
    } catch (err) {
      console.error('Error adding test files:', err);
      setError(err instanceof Error ? err.message : 'Failed to add test files');
    } finally {
      setIsUpdatingTestFiles(false);
    }
  };

  const handleRemoveTestFile = async (filePath: string) => {
    if (!project || isUpdatingTestFiles) return;

    try {
      setIsUpdatingTestFiles(true);
      const response = await fetch(`http://localhost:3001/api/projects/${id}/test-files`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testFiles: [filePath] }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to remove test file');
      }

      // Refresh project details to get updated test files
      fetchProjectDetails();
    } catch (err) {
      console.error('Error removing test file:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove test file');
    } finally {
      setIsUpdatingTestFiles(false);
    }
  };

  if (isLoading) {
    return (
      <div className="project-details-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-details-page">
        <div className="error-state">
          <h2>Project Not Found</h2>
          <p>The requested project could not be found.</p>
          <button 
            className="back-button"
            onClick={() => navigate('/projects')}
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-details-page">
      <div className="project-details-header">
        <div className="header-content">
          <button 
            className="back-button"
            onClick={() => navigate('/projects')}
          >
            ← Back to Projects
          </button>
          <h1>{project.name}</h1>
          <span className={`status-badge ${project.status}`}>
            {project.status}
          </span>
        </div>
        <div className="header-actions">
          <button 
            className="edit-button"
            onClick={() => setShowEditModal(true)}
          >
            Edit Project
          </button>
          <button 
            className="delete-button"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Project
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchProjectDetails} className="retry-button">
            Retry
          </button>
        </div>
      )}

      <div className="project-details-content">
        <div className="details-section">
          <h2>Project Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Description</span>
              <p className="value">{project.description || 'No description provided'}</p>
            </div>
            <div className="info-item">
              <span className="label">Test Site</span>
              <p className="value">{project.testSite}</p>
            </div>
            <div className="info-item">
              <span className="label">Site Address</span>
              <a 
                href={project.siteAddress} 
                target="_blank" 
                rel="noopener noreferrer"
                className="value link"
              >
                {project.siteAddress}
              </a>
            </div>
            <div className="info-item">
              <span className="label">Version</span>
              <p className="value">{project.version}</p>
            </div>
            <div className="info-item">
              <span className="label">Created</span>
              <p className="value">{formatDate(project.createdAt)}</p>
            </div>
            <div className="info-item">
              <span className="label">Last Updated</span>
              <p className="value">{formatDate(project.updatedAt)}</p>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h2>Status Management</h2>
          <div className="status-controls">
            <button
              className={`status-button draft ${project.status === 'draft' ? 'active' : ''}`}
              onClick={() => handleStatusUpdate('draft')}
              disabled={project.status === 'draft' || isUpdatingStatus}
            >
              Draft
            </button>
            <button
              className={`status-button active ${project.status === 'active' ? 'active' : ''}`}
              onClick={() => handleStatusUpdate('active')}
              disabled={project.status === 'active' || isUpdatingStatus}
            >
              Active
            </button>
            <button
              className={`status-button completed ${project.status === 'completed' ? 'active' : ''}`}
              onClick={() => handleStatusUpdate('completed')}
              disabled={project.status === 'completed' || isUpdatingStatus}
            >
              Completed
            </button>
            <button
              className={`status-button archived ${project.status === 'archived' ? 'active' : ''}`}
              onClick={() => handleStatusUpdate('archived')}
              disabled={project.status === 'archived' || isUpdatingStatus}
            >
              Archived
            </button>
          </div>
        </div>

        <div className="details-section">
          <div className="section-header">
            <h2>Test Files</h2>
            <button 
              className="add-files-button"
              onClick={() => setShowTestFileSelector(true)}
              disabled={isUpdatingTestFiles}
            >
              Add Test Files
            </button>
          </div>
          {project.testFiles.length > 0 ? (
            <div className="test-files-list">
              {project.testFiles.map((file, index) => (
                <div key={index} className="test-file-item">
                  <span className="file-path">{file}</span>
                  <button 
                    className="remove-file-button"
                    onClick={() => handleRemoveTestFile(file)}
                    disabled={isUpdatingTestFiles}
                  >
                    {isUpdatingTestFiles ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-files-message">
              No test files have been added to this project yet.
            </p>
          )}
        </div>

        {project.testFiles.length > 0 && (
          <>
            <div className="details-section">
              <h2>Test Runner</h2>
              <ProjectTestRunner
                projectId={project.id}
                testFiles={project.testFiles}
              />
            </div>

            <div className="details-section">
              <ProjectTestHistory projectId={project.id} />
            </div>
          </>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h2>Delete Project?</h2>
            <p>
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="delete-button"
                onClick={handleDeleteProject}
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && project && (
        <EditProjectModal
          project={project}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleProjectUpdate}
        />
      )}

      {showTestFileSelector && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Test Files</h2>
              <button 
                className="close-button"
                onClick={() => setShowTestFileSelector(false)}
              >
                &times;
              </button>
            </div>
            <TestFileSelector
              onSelectionChange={handleAddTestFiles}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 