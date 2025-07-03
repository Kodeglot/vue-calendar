# Contributing Guide

We welcome contributions from the community! Here's how you can help improve Vue Calendar.

## Getting Started

1. Fork the repository
2. Clone your fork locally: `git clone https://github.com/YOUR_USERNAME/vue-calendar.git`
3. Navigate to the project directory: `cd vue-calendar`
4. Install dependencies: `npm install`
5. Create a new branch: `git checkout -b feature/your-feature-name`
6. Make your changes
7. Run tests and linting (see Development Commands below)
8. Commit your changes: `git commit -am 'Add some feature'`
9. Push to the branch: `git push origin feature/your-feature-name`
10. Create a new Pull Request

## Development Commands

### Development Server
- `npm run dev` - Start the main development server
- `npm run demo` - Start the demo development server
- `npm run demo:standalone` - Build and open standalone demo

### Building
- `npm run build` - Build the library for production
- `npm run build:lib` - Build only the library files
- `npm run build:types` - Generate TypeScript declaration files
- `npm run build:demo` - Build the demo for deployment

### Testing
- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Code Quality
- `npm run lint` - Run ESLint with auto-fix
- `npm run type-check` - Run TypeScript type checking

### Preview
- `npm run preview` - Preview the built demo locally

## Code Style

- Follow Vue 3 composition API patterns
- Use TypeScript for all new code
- Adhere to Tailwind CSS utility class conventions
- Maintain consistent formatting (Prettier is configured)
- Write unit tests for new features using Vitest
- Use Pinia for state management when needed
- Follow the existing project structure and naming conventions

## Project Structure

```
vue-calendar/
├── src/           # Source code
├── demo/          # Demo application
├── tests/         # Test files
├── dist/          # Built files (generated)
├── public/        # Static assets
└── vite.config.*  # Vite configuration files
```

## Testing Guidelines

- Write tests for all new features and bug fixes
- Use `@vue/test-utils` for component testing
- Test both component logic and user interactions
- Ensure good test coverage for critical functionality
- Use descriptive test names that explain the expected behavior

## Pull Request Guidelines

- Keep PRs focused on a single feature or bug fix
- Include relevant tests for new functionality
- Update documentation if needed (README.md, CHANGELOG.md)
- Reference any related issues using keywords like "Fixes #123" or "Closes #456"
- Provide clear description of changes and reasoning
- Ensure all tests pass and linting is clean
- Update the CHANGELOG.md with a brief description of changes

## Reporting Issues

When reporting bugs, please include:
- Vue version (should be ^3.3.0)
- Browser version and OS
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots or GIFs if applicable
- Console errors if any
- Minimal reproduction case if possible

## Feature Requests

We welcome feature requests! Please:
- Explain the problem you're trying to solve
- Describe your proposed solution
- Provide examples of similar implementations in other libraries
- Explain why this would be valuable to other users
- Consider the impact on bundle size and performance

## Dependencies

When adding new dependencies:
- Prefer lightweight, well-maintained packages
- Consider the impact on bundle size
- Ensure compatibility with Vue 3 and TypeScript
- Add appropriate peer dependencies if needed
- Update the package.json with correct version ranges

## Release Process

- Version updates should follow semantic versioning
- Update the version in package.json
- Update CHANGELOG.md with detailed release notes
- Ensure all tests pass before releasing
- Build and test the demo before publishing

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms.

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

## Getting Help

If you need help with contributing:
- Check existing issues and pull requests
- Join our community discussions
- Ask questions in the issues section
- Review the README.md for project documentation
