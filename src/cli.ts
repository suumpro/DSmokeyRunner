import { scanTestFiles } from './fileScanner';
import { runPlaywrightTests } from './testRunner';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    console.log(`
DSmokey Runner - Playwright Test Runner CLI

Usage:
  npx ts-node src/cli.ts <command> [options]

Commands:
  scan <path...>     Scan directories for test files
  run <path...>      Run Playwright tests for specified files/folders
  scan-run <path...> Scan directories and run discovered tests

Examples:
  npx ts-node src/cli.ts scan ./tests
  npx ts-node src/cli.ts run ./tests/unit/example.spec.ts
  npx ts-node src/cli.ts scan-run ./tests
`);
    process.exit(0);
  }

  const paths = args.slice(1);
  if (paths.length === 0) {
    paths.push('./tests'); // Default to tests directory
  }

  try {
    switch (command) {
      case 'scan':
        const files = scanTestFiles(paths);
        console.log('\nDiscovered test files:');
        files.forEach(file => console.log(`- ${file}`));
        break;

      case 'run':
        await runPlaywrightTests(paths);
        break;

      case 'scan-run':
        const testFiles = scanTestFiles(paths);
        if (testFiles.length === 0) {
          console.log('No test files found.');
          process.exit(0);
        }
        await runPlaywrightTests(testFiles);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the CLI
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 