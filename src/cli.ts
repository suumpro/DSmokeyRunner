import express from 'express';
import cors from 'cors';
import { scanTestFiles } from './fileScanner';
import { runPlaywrightTests } from './testRunner';
import path from 'path';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const port = 3001;

// Basic root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'DSmokey Runner API is running',
    endpoints: {
      'GET /': 'This info',
      'GET /api/test-files': 'Get list of test files',
      'POST /api/run-tests': 'Run specified tests'
    }
  });
});

app.get('/api/test-files', async (req, res) => {
  try {
    const testFiles = await scanTestFiles(['./tests']);
    console.log('📁 Found test files:', testFiles);
    res.json({ testFiles });
  } catch (error) {
    console.error('❌ Error scanning test files:', error);
    res.status(500).json({ error: 'Failed to scan test files' });
  }
});

app.post('/api/run-tests', async (req, res) => {
  const { targets } = req.body;
  
  if (!targets || !Array.isArray(targets) || targets.length === 0) {
    return res.status(400).json({ error: 'No test targets provided' });
  }

  try {
    console.log('🎯 Running tests for targets:', targets);
    
    const result = await runPlaywrightTests(targets);
    
    console.log('📋 Raw test result:', {
      success: result.success,
      output: result.output,
      outputType: typeof result.output,
      outputLength: result.output?.length,
      summary: result.summary,
      error: result.error
    });

    // Ensure we have valid data
    const response = {
      success: result.success,
      output: result.output || 'No output received from test run',
      summary: result.summary || {
        total: 0,
        passed: 0,
        failed: 0,
        duration: 0
      }
    };

    console.log('📤 Sending response:', response);
    
    res.json(response);
  } catch (error) {
    console.error('❌ Test run error:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to run tests',
      output: error instanceof Error ? error.stack || error.message : 'Unknown error occurred',
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        duration: 0
      }
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`
🚀 DSmokey Runner Server is running!
   
   URL: http://localhost:${port}
   
   Available endpoints:
   - GET  /                 → API info
   - GET  /api/test-files   → List test files
   - POST /api/run-tests    → Execute tests
   
   Server is ready to accept requests...
`);
}); 