import { spawn } from 'child_process';
import path from 'path';

interface TestResult {
  success: boolean;
  output: string;  // Changed from logs array to single output string
  summary: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
  };
  error?: string;
}

/**
 * Runs Playwright tests for the specified files or folders
 * @param targetPaths Array of file or folder paths to test
 * @returns Promise that resolves with exit code
 */
export async function runPlaywrightTests(targets: string[]): Promise<TestResult> {
  const startTime = Date.now();
  const projectRoot = process.cwd();
  const normalizedPaths = targets.map(p => path.resolve(projectRoot, p));
  
  console.log('🚀 Starting Playwright tests:', {
    targets,
    normalizedPaths,
    projectRoot
  });

  return new Promise((resolve) => {
    let output = '';
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    console.log('📑 Spawning Playwright process:', {
      command: 'npx playwright test',
      args: normalizedPaths,
      cwd: projectRoot
    });

    const playwrightProcess = spawn('npx', [
      'playwright',
      'test',
      ...normalizedPaths,
      '--reporter=list'
    ], {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: projectRoot,
      env: { ...process.env, FORCE_COLOR: '0' },
      shell: true
    });

    playwrightProcess.stdout.on('data', (data) => {
      const text = data.toString();
      console.log('📤 Playwright stdout:', text);
      output += text;
      
      if (text.includes('✓')) passedTests++;
      if (text.includes('✘')) failedTests++;
      totalTests = passedTests + failedTests;

      console.log('📊 Current test counts:', {
        passed: passedTests,
        failed: failedTests,
        total: totalTests
      });
    });

    playwrightProcess.stderr.on('data', (data) => {
      const text = data.toString();
      console.log('⚠️ Playwright stderr:', text);
      output += text;
    });

    playwrightProcess.on('close', (code) => {
      console.log('🏁 Playwright process closed:', {
        code,
        outputLength: output.length,
        testCounts: { totalTests, passedTests, failedTests }
      });

      const duration = Date.now() - startTime;
      
      if (output && totalTests === 0) {
        totalTests = 1;
        if (code === 0) {
          passedTests = 1;
        } else {
          failedTests = 1;
        }
      }

      output += `\nTest Summary:\n`;
      output += `Total: ${totalTests}\n`;
      output += `Passed: ${passedTests}\n`;
      output += `Failed: ${code === 0 ? 0 : failedTests}\n`;
      output += `Duration: ${duration}ms\n`;

      const result: TestResult = {
        success: code === 0,
        output,
        summary: {
          total: totalTests,
          passed: passedTests,
          failed: code === 0 ? 0 : failedTests,
          duration
        }
      };

      console.log('✅ Test run completed:', {
        success: result.success,
        outputLength: result.output.length,
        summary: result.summary
      });

      resolve(result);
    });

    playwrightProcess.on('error', (err) => {
      console.error('❌ Playwright process error:', err);
      output += `Error: ${err.message}\n`;
      
      const result: TestResult = {
        success: false,
        output,
        summary: {
          total: totalTests,
          passed: passedTests,
          failed: failedTests,
          duration: Date.now() - startTime
        },
        error: err.message
      };

      console.log('⚠️ Test run failed:', {
        error: err.message,
        outputLength: result.output.length,
        summary: result.summary
      });

      resolve(result);
    });
  });
}
