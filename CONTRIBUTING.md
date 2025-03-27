# Contributing to DSmokey Runner

Thank you for your interest in contributing to DSmokey Runner! We're excited to have you join our community. This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/DSmokeyRunner.git
   cd DSmokeyRunner
   ```
3. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-fix-name
   ```

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   cd ui && npm install && cd ..
   ```

2. Start the development environment:
   ```bash
   npm run dev:all
   ```

## Project Architecture

- `src/` - Backend Node.js/Express server
  - `cli.ts` - Command-line interface and main entry point
  - Other backend modules and utilities

- `ui/` - Frontend React/Vue application
  - Contains the user interface code
  - Has its own package.json and dependencies

- `tests/` - Test files directory
  - Place your test files here
  - Follow the existing test patterns

## Making Changes

1. Make your changes in your feature branch
2. Write or update tests as needed
3. Follow the coding style of the project:
   - Use TypeScript
   - Follow ESLint rules
   - Write meaningful commit messages
   - Add comments for complex logic

## Testing

Before submitting your changes:

1. Run the test suite:
   ```bash
   npm run test
   ```

2. Ensure your changes don't break existing functionality:
   ```bash
   npm run test:scan
   ```

## Submitting Changes

1. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a Pull Request:
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill in the PR template with:
     - Description of changes
     - Related issue numbers
     - Screenshots (if UI changes)
     - Any breaking changes

## Pull Request Guidelines

- Keep PRs focused on a single change
- Update documentation as needed
- Add tests for new features
- Follow the existing code style
- Ensure all tests pass
- Respond to review comments promptly

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Express.js Documentation](https://expressjs.com/)

## Questions or Problems?

Feel free to:
- Open an issue for bugs or feature requests
- Ask questions in the discussions section
- Reach out to the maintainers

Thank you for contributing to DSmokey Runner! 