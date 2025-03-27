# DSmokey Runner

A modern, feature-rich Playwright-based automation runner for web automation tasks. DSmokey Runner provides a sleek UI interface to manage, run, and monitor your automation tests with ease.

## Tech Stack

### Backend
- Node.js & Express.js - Server framework
- TypeScript - Type-safe development
- Zod - Runtime type validation and schema definition
- Playwright - Web automation and testing
- Jest - Unit testing
- fs-extra - Enhanced file system operations

### Frontend
- React 18 - UI library
- TypeScript - Type-safe development
- Vite - Build tool and development server
- React Router - Client-side routing
- CSS Modules - Scoped styling
- Axios - HTTP client

### Development Tools
- ESLint - Code linting
- Prettier - Code formatting
- Nodemon - Development auto-reload
- Concurrently - Running multiple scripts

## Features

- 🎭 Built on top of Playwright for reliable web automation
- 🖥️ Modern React-based UI interface for test management
- 📋 Project-based test organization
- 🚀 Fast and concurrent test execution
- 📊 Real-time test execution monitoring
- 📝 Detailed test reports and history
- 🔄 Auto-scanning of test files
- 🛠️ Easy configuration and setup
- 🔒 Type-safe development with TypeScript
- 📱 Responsive design for various screen sizes

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
├── src/                # Backend source code
│   ├── cli.ts         # Command-line interface
│   ├── routes/        # API routes
│   ├── types/         # TypeScript types and schemas
│   └── utils/         # Utility functions
├── ui/                # Frontend UI code
│   ├── src/
│   │   ├── components/# React components
│   │   ├── pages/     # Page components
│   │   ├── styles/    # Global styles
│   │   └── utils/     # Frontend utilities
│   └── public/        # Static assets
├── tests/             # Test files
│   ├── unit/         # Unit tests
│   └── integration/  # Integration tests
├── dist/             # Compiled output
└── test-results/     # Test execution results
```

## Configuration

The project uses TypeScript and is configured via `tsconfig.json`. For Playwright configuration, check `playwright.config.ts`.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

ISC

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository. 