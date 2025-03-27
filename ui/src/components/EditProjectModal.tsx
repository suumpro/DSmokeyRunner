import React, { useState, useEffect } from 'react';
import './EditProjectModal.css';

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

interface EditProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: ProjectFormData) => void;
}

interface ProjectFormData {
  name: string;
  description: string;
  testSite: string;
  siteAddress: string;
  version: string;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  project,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    testSite: '',
    siteAddress: '',
    version: '',
  });

  const [errors, setErrors] = useState<Partial<ProjectFormData>>({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        testSite: project.testSite,
        siteAddress: project.siteAddress,
        version: project.version,
      });
    }
  }, [project]);

  const validateForm = () => {
    const newErrors: Partial<ProjectFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.siteAddress.trim()) {
      newErrors.siteAddress = 'Site address is required';
    } else if (!/^https?:\/\/.+/.test(formData.siteAddress)) {
      newErrors.siteAddress = 'Please enter a valid URL starting with http:// or https://';
    }

    if (!formData.version.trim()) {
      newErrors.version = 'Version is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ProjectFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Project</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Project Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter project name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter project description"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="testSite">Test Site Name</label>
            <input
              type="text"
              id="testSite"
              name="testSite"
              value={formData.testSite}
              onChange={handleChange}
              placeholder="Enter test site name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="siteAddress">Site Address *</label>
            <input
              type="text"
              id="siteAddress"
              name="siteAddress"
              value={formData.siteAddress}
              onChange={handleChange}
              placeholder="https://example.com"
              className={errors.siteAddress ? 'error' : ''}
            />
            {errors.siteAddress && <span className="error-message">{errors.siteAddress}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="version">Version *</label>
            <input
              type="text"
              id="version"
              name="version"
              value={formData.version}
              onChange={handleChange}
              placeholder="e.g., 1.0.0"
              className={errors.version ? 'error' : ''}
            />
            {errors.version && <span className="error-message">{errors.version}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 