import express from 'express';
import cors from 'cors';
import { runPlaywrightTests } from './testRunner';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'DSmokeyRunner API is running' });
});

// Get list of test files
app.get('/api/test-files', (req, res) => {
  // TODO: Implement dynamic test file discovery
  const testFiles = ['tests/integration/login.spec.js'];
  res.json({ testFiles });
});

// Run tests endpoint
app.post('/api/run-tests', async (req, res) => {
  try {
    console.log('Received request to run tests:', req.body);
    const result = await runPlaywrightTests(req.body.testFiles);
    console.log('Test execution completed:', result);
    res.json({
      success: true,
      output: result.output,
      summary: {
        total: result.totalTests,
        passed: result.passedTests,
        failed: result.failedTests,
        duration: result.duration
      }
    });
  } catch (error) {
    console.error('Error running tests:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      output: error.output || 'No output available'
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
