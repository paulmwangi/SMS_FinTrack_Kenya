# Contributing to SMS-FinTrack Kenya

Thank you for your interest in contributing to SMS-FinTrack Kenya! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing viewpoints

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Environment**: OS, Node version, browser, etc.
- **Screenshots**: If applicable

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Description**: Clear description of the enhancement
- **Use Case**: Why this enhancement would be useful
- **Proposed Solution**: How you envision this working
- **Alternatives**: Alternative solutions you've considered

### Pull Requests

1. **Fork the Repository**
   ```bash
   git clone https://github.com/paulmwangi/SMS_FinTrack.git
   cd SMS_FinTrack
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make Your Changes**
   - Follow the existing code style
   - Write clear commit messages
   - Add tests if applicable
   - Update documentation

4. **Test Your Changes**
   ```bash
   # Backend
   cd backend
   npm run build
   npm test

   # Frontend
   cd frontend
   npm run build
   npm test
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # or
   git commit -m "fix: resolve bug in SMS parser"
   ```

   Use conventional commit messages:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request**
   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template
   - Submit!

## Development Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15
- Git

### Setup Steps

1. Clone your fork
2. Install dependencies
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Setup environment variables
4. Run migrations
5. Start development servers

See [TESTING.md](TESTING.md) for detailed setup instructions.

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for new code
- Follow existing code style
- Use meaningful variable names
- Add JSDoc comments for functions
- Keep functions small and focused
- Use async/await over callbacks

### React/Frontend

- Use functional components with hooks
- Follow React best practices
- Keep components small and reusable
- Use TypeScript types/interfaces
- Follow existing folder structure

### Database

- Use Prisma for all database operations
- Write migrations for schema changes
- Include rollback in migrations
- Test migrations thoroughly

### API Design

- Follow REST conventions
- Use proper HTTP status codes
- Include error messages
- Document all endpoints
- Validate all inputs

## Project Structure

```
SMS_FinTrack/
├── backend/
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # (Currently using Prisma)
│   │   ├── routes/       # Route definitions
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   ├── prisma/           # Database schema & migrations
│   └── tests/            # Backend tests
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── store/        # State management
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
└── docs/                 # Additional documentation
```

## Testing Guidelines

### Unit Tests

- Write tests for new features
- Test edge cases
- Mock external dependencies
- Aim for >80% coverage

### Integration Tests

- Test API endpoints
- Test database operations
- Test authentication/authorization
- Test error handling

### E2E Tests

- Test critical user flows
- Test across different browsers
- Test mobile responsiveness

## Documentation

- Update README.md if adding features
- Update API.md for new endpoints
- Add JSDoc comments
- Include examples where helpful
- Keep documentation up to date

## Commit Message Guidelines

Format: `<type>(<scope>): <subject>`

Examples:
```
feat(auth): add password reset functionality
fix(sms): correct M-Pesa SMS parsing regex
docs(api): update transaction endpoints documentation
refactor(database): optimize transaction queries
test(parser): add tests for KCB SMS format
```

## Review Process

1. All PRs require review
2. Address review comments
3. Keep PRs focused and small
4. Ensure CI passes
5. Squash commits if requested

## Areas for Contribution

### High Priority

- [ ] Add comprehensive test coverage
- [ ] Improve error handling
- [ ] Add rate limiting
- [ ] Implement email notifications
- [ ] Add data export functionality
- [ ] Improve mobile UI

### Medium Priority

- [ ] Add more bank SMS formats
- [ ] Implement WhatsApp integration
- [ ] Add advanced reporting
- [ ] Improve documentation
- [ ] Add localization (Swahili)

### Good First Issues

- [ ] Add input validation
- [ ] Improve error messages
- [ ] Add loading states
- [ ] Fix typos in documentation
- [ ] Improve accessibility

## Questions?

- Open an issue for discussion
- Join our community chat (if available)
- Email: support@smsfintrack.co.ke

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

## Recognition

Contributors will be added to the README.md contributors section.

Thank you for contributing to SMS-FinTrack Kenya! 🎉
