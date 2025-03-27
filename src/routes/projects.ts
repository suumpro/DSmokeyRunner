import express from 'express';
import {
  initializeProjects,
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
  addTestFiles,
  removeTestFiles
} from '../projects';
import { ProjectStatus } from '../types/Project';

const router = express.Router();

// Initialize projects database
initializeProjects().catch(error => {
  console.error('Failed to initialize projects database:', error);
  process.exit(1);
});

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await getProjects();
    res.json({ projects });
  } catch (error) {
    console.error('Failed to get projects:', error);
    res.status(500).json({ error: 'Failed to retrieve projects' });
  }
});

// Get a specific project
router.get('/:id', async (req, res) => {
  try {
    const project = await getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Failed to get project:', error);
    res.status(500).json({ error: 'Failed to retrieve project' });
  }
});

// Create a new project
router.post('/', async (req, res) => {
  try {
    const project = await createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    console.error('Failed to create project:', error);
    const message = error instanceof Error ? error.message : 'Failed to create project';
    res.status(400).json({ error: message });
  }
});

// Update a project
router.put('/:id', async (req, res) => {
  try {
    const project = await updateProject(req.params.id, req.body);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Failed to update project:', error);
    const message = error instanceof Error ? error.message : 'Failed to update project';
    res.status(400).json({ error: message });
  }
});

// Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteProject(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Failed to delete project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Update project status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !Object.values(ProjectStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status provided' });
    }
    
    const project = await updateProjectStatus(req.params.id, status);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Failed to update project status:', error);
    res.status(500).json({ error: 'Failed to update project status' });
  }
});

// Add test files to a project
router.post('/:id/test-files', async (req, res) => {
  try {
    const { testFiles } = req.body;
    if (!testFiles || !Array.isArray(testFiles)) {
      return res.status(400).json({ error: 'Invalid test files provided' });
    }
    
    const project = await addTestFiles(req.params.id, testFiles);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Failed to add test files:', error);
    res.status(500).json({ error: 'Failed to add test files' });
  }
});

// Remove test files from a project
router.delete('/:id/test-files', async (req, res) => {
  try {
    const { testFiles } = req.body;
    if (!testFiles || !Array.isArray(testFiles)) {
      return res.status(400).json({ error: 'Invalid test files provided' });
    }
    
    const project = await removeTestFiles(req.params.id, testFiles);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Failed to remove test files:', error);
    res.status(500).json({ error: 'Failed to remove test files' });
  }
});

export default router; 