import express from 'express';
import cors from 'cors';
import { scanTestFiles } from './fileScanner';
import { runPlaywrightTests } from './testRunner';

const app = express();
app.use(cors());
app.use(express.json());

// API endpoint to get test files
app.get('/api/test-files', (req, res) => {
  try {
    const testFiles = scanTestFiles(['./tests']); // Scan default tests directory
    res.json({ testFiles });
  } catch (error) {
    console.error('Error scanning test files:', error);
    res.status(500).json({ error: 'Failed to scan test files' });
  }
});

// API endpoint to run tests
app.post('/api/run-tests', async (req, res) => {
  try {
    const { targets } = req.body;
    if (!targets || !Array.isArray(targets) || targets.length === 0) {
      return res.status(400).json({ error: 'Invalid targets provided' });
    }

    await runPlaywrightTests(targets);
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error running tests:', error);
    res.status(500).json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to run tests' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 