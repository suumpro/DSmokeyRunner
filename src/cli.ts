import express from 'express';
import cors from 'cors';
import { scanTestFiles } from './fileScanner';
import { runPlaywrightTests } from './testRunner';
import path from 'path';
import { 
  initializeHistory, 
  addHistoryEntry, 
  getHistory, 
  getHistoryEntry,
  clearHistory,
  deleteHistoryEntry
} from './history';

// Define interfaces for better type safety
interface TestResult {
  success: boolean;
  output: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
  };
  error?: string;
  runId?: string;
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const port = 3001;

// Initialize history database
initializeHistory().catch(error => {
  console.error('Failed to initialize history database:', error);
  process.exit(1);
});

// Basic root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'DSmokey Runner API is running',
    endpoints: {
      'GET /': 'This info',
      'GET /api/test-files': 'Get list of test files',
      'POST /api/run-tests': 'Run specified tests',
      'GET /api/history': 'Get test run history',
      'GET /api/history/:runId': 'Get specific test run details',
      'DELETE /api/history/:runId': 'Delete specific history entry',
      'POST /api/history/clear': 'Clear all history'
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
  const { testFiles } = req.body;
  
  if (!testFiles || !Array.isArray(testFiles) || testFiles.length === 0) {
    return res.status(400).json({ error: 'No test files provided' });
  }

  try {
    console.log('🎯 Running tests for files:', testFiles);
    
    const result = await runPlaywrightTests(testFiles);
    
    // Add to history
    const historyEntry = await addHistoryEntry({
      testFiles,
      status: result.success ? 'passed' : 'failed',
      summary: result.summary,
      output: result.output || ''
    });
    
    console.log('📋 Test run recorded in history:', historyEntry.runId);
    
    // Send the result directly as it matches our interface
    console.log('📤 Sending response:', result);
    res.json({ ...result, runId: historyEntry.runId });
  } catch (error) {
    const errorResult: TestResult = {
      success: false,
      output: error instanceof Error ? error.stack || error.message : 'Unknown error occurred',
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        duration: 0
      },
      error: error instanceof Error ? error.message : 'Failed to run tests'
    };

    // Add failed run to history
    try {
      const historyEntry = await addHistoryEntry({
        testFiles,
        status: 'error',
        summary: errorResult.summary,
        output: errorResult.output
      });
      
      // Update the error result with the runId
      const finalResult = { ...errorResult, runId: historyEntry.runId };
      console.error('❌ Test run error:', error);
      res.status(500).json(finalResult);
    } catch (historyError) {
      console.error('Failed to record error in history:', historyError);
      res.status(500).json(errorResult);
    }
  }
});

// History endpoints
app.get('/api/history', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
    const entries = await getHistory(limit, offset);
    res.json({ entries });
  } catch (error) {
    console.error('Failed to get history:', error);
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
});

app.get('/api/history/:runId', async (req, res) => {
  try {
    const entry = await getHistoryEntry(req.params.runId);
    if (!entry) {
      return res.status(404).json({ error: 'History entry not found' });
    }
    res.json(entry);
  } catch (error) {
    console.error('Failed to get history entry:', error);
    res.status(500).json({ error: 'Failed to retrieve history entry' });
  }
});

app.delete('/api/history/:runId', async (req, res) => {
  try {
    const deleted = await deleteHistoryEntry(req.params.runId);
    if (!deleted) {
      return res.status(404).json({ error: 'History entry not found' });
    }
    res.json({ message: 'History entry deleted successfully' });
  } catch (error) {
    console.error('Failed to delete history entry:', error);
    res.status(500).json({ error: 'Failed to delete history entry' });
  }
});

app.post('/api/history/clear', async (req, res) => {
  try {
    await clearHistory();
    res.json({ message: 'History cleared successfully' });
  } catch (error) {
    console.error('Failed to clear history:', error);
    res.status(500).json({ error: 'Failed to clear history' });
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