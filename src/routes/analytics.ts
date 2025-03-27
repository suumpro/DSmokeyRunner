import express from 'express';
import { getProject } from '../projects';
import { getProjectAnalytics, updateProjectAnalytics } from '../services/analytics';

const router = express.Router();

// Get analytics for a specific project
router.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if project exists
    const project = await getProject(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get or generate analytics
    let analytics = await getProjectAnalytics(id);
    if (!analytics) {
      analytics = await updateProjectAnalytics(project);
    }

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching project analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update analytics for a specific project
router.post('/projects/:id/refresh', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if project exists
    const project = await getProject(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Generate fresh analytics
    const analytics = await updateProjectAnalytics(project);
    res.json(analytics);
  } catch (error) {
    console.error('Error updating project analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 