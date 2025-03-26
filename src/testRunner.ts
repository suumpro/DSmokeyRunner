import { spawn } from 'child_process';
import path from 'path';

/**
 * Runs Playwright tests for the specified files or folders
 * @param targetPaths Array of file or folder paths to test
 * @returns Promise that resolves with exit code
 */
export function runPlaywrightTests(targetPaths: string[]): Promise<number> {
  // Normalize paths to be relative to project root
  const normalizedPaths = targetPaths.map(p => path.resolve(p));
  
  console.log('\nRunning Playwright tests for:', normalizedPaths);
  
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['playwright', 'test', ...normalizedPaths], {
      stdio: 'inherit', // Show logs directly
      shell: true,
      cwd: process.cwd() // Ensure we're in the right directory
    });

    child.on('error', (error) => {
      console.error('Failed to start test process:', error);
      reject(1);
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Tests completed successfully');
        resolve(0);
      } else {
        console.error(`\n❌ Tests failed with code ${code}`);
        reject(code ?? 1);
      }
    });
  });
} 