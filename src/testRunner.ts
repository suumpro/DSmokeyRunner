import { spawn } from 'child_process';
import path from 'path';

interface TestResult {
  output: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
}

export async function runPlaywrightTests(targetPaths: string[]): Promise<TestResult> {
  console.log('Running tests with paths:', targetPaths);
  console.log('Current working directory:', process.cwd());

  const normalizedPaths = targetPaths.map(p => path.normalize(p));
  console.log('Normalized test paths:', normalizedPaths);

  return new Promise((resolve, reject) => {
    console.log('Spawning Playwright process with command:', 'npx', ['playwright', 'test', ...normalizedPaths]);
    
    const playwright = spawn('npx', ['playwright', 'test', ...normalizedPaths], {
      shell: true
    });

    let output = '';
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let duration = 0;

    playwright.stdout.on('data', (data) => {
      const chunk = data.toString();
      console.log('Playwright stdout:', chunk);
      output += chunk;

      // Count tests based on output
      if (chunk.includes('passed')) passedTests++;
      if (chunk.includes('failed')) failedTests++;
    });

    playwright.stderr.on('data', (data) => {
      const chunk = data.toString();
      console.log('Playwright stderr:', chunk);
      output += chunk;
    });

    playwright.on('close', (code) => {
      console.log('Playwright process exited with code:', code);
      
      totalTests = passedTests + failedTests;
      // Ensure at least one test is counted if we got output
      if (output && totalTests === 0) {
        totalTests = 1;
        passedTests = code === 0 ? 1 : 0;
        failedTests = code === 0 ? 0 : 1;
      }

      // Extract duration from output if possible
      const durationMatch = output.match(/(\d+(\.\d+)?)(ms|s)/i);
      if (durationMatch) {
        duration = parseFloat(durationMatch[1]);
        if (durationMatch[3].toLowerCase() === 's') {
          duration *= 1000; // Convert seconds to milliseconds
        }
      }

      if (code === 0 || output) {
        resolve({
          output,
          totalTests,
          passedTests,
          failedTests,
          duration
        });
      } else {
        reject(new Error(`Playwright process exited with code ${code}`));
      }
    });

    playwright.on('error', (error) => {
      console.error('Error spawning Playwright process:', error);
      reject(error);
    });
  });
}
