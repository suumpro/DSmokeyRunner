import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StatusManager } from '../components/StatusManager';
import { StatusHistory } from '../components/StatusHistory';
import { EditProjectModal } from '../components/EditProjectModal';
import { DeleteProjectModal } from '../components/DeleteProjectModal';
import './ProjectDetailsPage.css';

interface Project {
  id: string;
  name: string;
  description?: string;
  testSite: string;
  version: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  testFiles: string[];
  siteAddress: string;
  createdAt: string;
  updatedAt: string;
}

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/projects/${id}`);
      setProject(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError('Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Project['status']) => {
    if (!project) return;

    try {
      const response = await axios.patch(`http://localhost:3001/api/projects/${id}/status`, { status: newStatus });
      setProject(response.data);
    } catch (err) {
      console.error('Error updating project status:', err);
      // Error will be handled by StatusManager component
    }
  };

  const handleProjectUpdate = async (updatedData: Partial<Project>) => {
    try {
      const response = await axios.put(`http://localhost:3001/api/projects/${id}`, updatedData);
      setProject(response.data);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    }
  };

  const handleProjectDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/api/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  if (isLoading) {
    return <div className="project-details-loading">Loading project details...</div>;
  }

  if (error) {
    return <div className="project-details-error">{error}</div>;
  }

  if (!project) {
    return <div className="project-details-error">Project not found</div>;
  }

  return (
    <div className="project-details-page">
      <div className="project-details-header">
        <div className="header-content">
          <h1>{project.name}</h1>
          <div className="header-actions">
            <button className="edit-button" onClick={() => setShowEditModal(true)}>
              Edit Project
            </button>
            <button className="delete-button" onClick={() => setShowDeleteModal(true)}>
              Delete Project
            </button>
          </div>
        </div>
      </div>

      <div className="project-details-content">
        <div className="project-info-section">
          <h2>Project Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Test Site:</label>
              <span>{project.testSite}</span>
            </div>
            <div className="info-item">
              <label>Site Address:</label>
              <a href={project.siteAddress} target="_blank" rel="noopener noreferrer">
                {project.siteAddress}
              </a>
            </div>
            <div className="info-item">
              <label>Version:</label>
              <span>{project.version}</span>
            </div>
            <div className="info-item">
              <label>Created:</label>
              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Last Updated:</label>
              <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
          {project.description && (
            <div className="project-description">
              <h3>Description</h3>
              <p>{project.description}</p>
            </div>
          )}
        </div>

        <div className="project-status-section">
          <h2>Status Management</h2>
          <StatusManager
            projectId={project.id}
            currentStatus={project.status}
            onStatusChange={handleStatusChange}
          />
          <StatusHistory projectId={project.id} />
        </div>

        <div className="project-files-section">
          <h2>Test Files</h2>
          {project.testFiles.length > 0 ? (
            <ul className="test-files-list">
              {project.testFiles.map((file, index) => (
                <li key={index}>{file}</li>
              ))}
            </ul>
          ) : (
            <p className="no-files-message">No test files added yet</p>
          )}
        </div>
      </div>

      {showEditModal && (
        <EditProjectModal
          project={project}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleProjectUpdate}
        />
      )}

      {showDeleteModal && (
        <DeleteProjectModal
          project={project}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleProjectDelete}
        />
      )}
    </div>
  );
};
