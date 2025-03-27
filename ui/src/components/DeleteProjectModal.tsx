import React, { useState } from 'react';
import './DeleteProjectModal.css';

interface Project {
  name: string;
  testFiles: string[];
}

interface DeleteProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  project,
  isOpen,
  onClose,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await onDelete();
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal-content">
        <h2>Delete Project</h2>
        <p className="warning-message">
          Are you sure you want to delete <strong>{project.name}</strong>?
        </p>
        <div className="impact-warning">
          <h3>This will permanently delete:</h3>
          <ul>
            <li>Project configuration and settings</li>
            <li>Project status history</li>
            {project.testFiles.length > 0 && (
              <li>{project.testFiles.length} associated test file(s)</li>
            )}
            <li>All test execution history</li>
          </ul>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="modal-actions">
          <button
            className="cancel-button"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="delete-button"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  );
};
