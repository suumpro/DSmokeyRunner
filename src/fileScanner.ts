import fs from 'fs';
import path from 'path';

/**
 * Scans provided folder paths for test files (*.spec.js or *.spec.ts)
 * @param folderPaths Array of folder paths to scan
 * @returns Array of discovered test file paths
 */
export function scanTestFiles(folderPaths: string[]): string[] {
  const results: string[] = [];

  function recurse(currentPath: string) {
    const stat = fs.statSync(currentPath);
    if (stat.isDirectory()) {
      const subPaths = fs.readdirSync(currentPath);
      subPaths.forEach(sub => recurse(path.join(currentPath, sub)));
    } else if (stat.isFile() && (currentPath.endsWith('.spec.js') || currentPath.endsWith('.spec.ts'))) {
      results.push(currentPath);
    }
  }

  folderPaths.forEach(fp => {
    if (fs.existsSync(fp)) {
      recurse(fp);
    } else {
      console.warn(`Warning: Path ${fp} does not exist`);
    }
  });

  return results;
}

// If this file is run directly (not imported as a module)
if (require.main === module) {
  // Example usage
  const testPaths = process.argv.slice(2).length > 0 
    ? process.argv.slice(2) 
    : [path.join(__dirname, '../tests')];
  
  console.log('Scanning for test files in:', testPaths);
  const files = scanTestFiles(testPaths);
  console.log('\nDiscovered test files:');
  files.forEach(file => console.log(`- ${file}`));
} 