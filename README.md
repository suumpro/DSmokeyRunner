# DSmokey Runner

A modern, feature-rich Playwright-based automation runner for web automation tasks. DSmokey Runner provides a sleek UI interface to manage, run, and monitor your automation tests with ease.

## Features

- 🎭 Built on top of Playwright for reliable web automation
- 🖥️ Modern UI interface for test management
- 🚀 Fast and concurrent test execution
- 📊 Real-time test execution monitoring
- 📝 Detailed test reports and history
- 🔄 Auto-scanning of test files
- 🛠️ Easy configuration and setup

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/DSmokeyRunner.git
cd DSmokeyRunner
```

2. Install dependencies:
```bash
npm install
cd ui && npm install && cd ..
```

3. Build the project:
```bash
npm run build
```

4. Start the application:
```bash
# Start both backend and UI
npm run dev:all

# Or start them separately:
npm run dev     # Start backend
npm run ui      # Start UI in another terminal
```

## Available Scripts

- `npm start` - Start the application in production mode
- `npm run dev` - Start the backend in development mode with auto-reload
- `npm run ui` - Start the UI development server
- `npm run dev:all` - Start both backend and UI in development mode
- `npm run scan` - Scan for test files
- `npm run test` - Run tests
- `npm run test:scan` - Scan and run tests
- `npm run build` - Build the project

## Project Structure

```
DSmokeyRunner/
├── src/           # Backend source code
├── ui/            # Frontend UI code
├── tests/         # Test files
├── dist/          # Compiled output
└── test-results/  # Test execution results
```

## Configuration

The project uses TypeScript and is configured via `tsconfig.json`. For Playwright configuration, check `playwright.config.ts`.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

ISC

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository. 