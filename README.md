# Feature Management System

A modern, scalable React application for managing feature flags and toggles across multiple platforms. Built with TypeScript, clean architecture principles, and comprehensive testing.

## Architecture Overview

This application follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── domain/                 # Business logic (entities, services, interfaces)
│   ├── entities/          # Domain entities with business rules
│   ├── repositories/      # Repository interfaces
│   └── services/         # Business logic services
├── infrastructure/        # External concerns (API, databases, etc.)
│   ├── api/              # HTTP clients and API communication
│   └── repositories/     # Repository implementations
├── presentation/          # UI layer (React components, hooks, context)
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── context/         # React context for state management
│   └── pages/           # Page components
└── shared/               # Shared utilities, types, constants
    ├── types/           # TypeScript type definitions
    ├── utils/           # Utility functions
    ├── constants/       # Application constants
    └── container/       # Dependency injection container
```

### Key Architectural Benefits

- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Single Responsibility**: Each class/module has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Interface Segregation**: Clients depend only on interfaces they use
- **Testability**: Easy to mock dependencies and test in isolation

## Features

### Core Functionality
- Platform management (Web, Mobile, API)
- Feature group organization
- Feature flag creation and management
- Segment-based feature targeting
- Rollout percentage controls
- Audit logging and activity tracking
- Real-time feature value updates

### Technical Features
- **TypeScript** for type safety
- **Clean Architecture** for maintainability
- **Testing** with Jest & React Testing Library
- **Modern UI** with responsive design
- **State Management** with React Context
- **Dependency Injection** for loose coupling
- **ESLint & Prettier** for code quality
- **Husky & lint-staged** for git hooks

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https:github.com/aabbdduurr/featuresPOC-Management.git
   cd featuresPOC-Management
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure environment**
   
   Update the configuration in `src/shared/constants/index.ts`:
   ```typescript
   export const API_ENDPOINTS = {
     BASE_URL: process.env.REACT_APP_API_BASE_URL || '<LAMBDA-URL/API-GATEWAY-URL>',
     STATIC_URL: process.env.REACT_APP_STATIC_BASE_URL || '<S3-URL>',
   } as const;

   export const AUTH = {
     TOKEN: process.env.REACT_APP_AUTH_TOKEN || '<TOKEN>',
   } as const;
   ```

   Or create a `.env` file:
   ```env
   REACT_APP_API_BASE_URL=https:your-api-gateway-url.com
   REACT_APP_STATIC_BASE_URL=https:your-s3-bucket.amazonaws.com
   REACT_APP_AUTH_TOKEN=your-jwt-token
   ```

4. **Authentication Setup**
   
   The system expects a signed JWT token with the following payload:
   ```json
   {
     "user": {
       "email": "<EMAIL>"
     }
   }
   ```
   
   Default secret: `togglePOC` (configurable in the Lambda function)

## Development

### Available Scripts

```bash
# Development
npm start              # Start development server
npm run type-check     # Run TypeScript type checking

# Testing
npm test              # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:ci       # Run tests in CI mode

# Code Quality
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues automatically
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting

# Production
npm run build         # Create production build
```

### Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** following the established architecture

3. **Run tests and linting**
   ```bash
   npm run test:coverage
   npm run lint
   npm run type-check
   ```

4. **Commit changes** (pre-commit hooks will run automatically)
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Testing Strategy

### Test Structure
```
__tests__/
├── unit/              # Unit tests for individual components/functions
├── integration/       # Integration tests for user workflows
└── mocks/            # Test utilities and mock data
```

### Testing Approach
- **Unit Tests**: Test individual components and functions in isolation
- **Integration Tests**: Test user workflows and component interactions
- **Mocking**: API calls and external dependencies are mocked
- **Coverage**: Minimum 80% coverage threshold enforced

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- PlatformDropdown.test.tsx

# Run in CI mode
npm run test:ci
```

## Project Structure

### Domain Layer (`src/domain/`)
Contains business logic, entities, and service interfaces.

**Key Files:**
- `entities/index.ts` - Business entities (Platform, Group, Feature)
- `services/index.ts` - Business logic services
- `repositories/index.ts` - Repository interfaces

### Infrastructure Layer (`src/infrastructure/`)
Handles external concerns like API communication.

**Key Files:**
- `api/httpClient.ts` - HTTP client for API calls
- `repositories/index.ts` - Repository implementations

### Presentation Layer (`src/presentation/`)
React UI components, hooks, and state management.

**Key Components:**
- `components/Header/` - Application header
- `components/PlatformSection/` - Platform selection
- `components/GroupsSection/` - Feature groups display
- `components/shared/` - Reusable UI components

### Shared Layer (`src/shared/`)
Common utilities, types, and constants.

**Key Files:**
- `types/index.ts` - TypeScript type definitions
- `utils/index.ts` - Utility functions
- `constants/index.ts` - Application constants
- `container/index.ts` - Dependency injection setup

## Configuration

### TypeScript Configuration
- Strict mode enabled
- Path mapping for clean imports
- React JSX support
- Modern ES target (ES2020)

### ESLint Configuration
- TypeScript support
- React hooks rules
- Prettier integration
- Custom rules for code quality

### Jest Configuration
- React Testing Library setup
- Coverage thresholds (80%)
- TypeScript support
- Mock utilities

## Deployment

### Build for Production
```bash
npm run build
```

The build folder will contain optimized production files ready for deployment.

### Environment Variables
Set the following environment variables for production:

```env
REACT_APP_API_BASE_URL=https:your-production-api.com
REACT_APP_STATIC_BASE_URL=https:your-production-static-assets.com
REACT_APP_AUTH_TOKEN=your-production-jwt
```

## Contributing

### Code Style
- Use TypeScript for all new code
- Follow the established architecture patterns
- Write tests for new functionality
- Use meaningful commit messages

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes following the code style
4. Add/update tests as necessary
5. Ensure all tests pass and coverage is maintained
6. Submit a pull request with a clear description

### Architecture Guidelines
- Keep business logic in the domain layer
- Use dependency injection for loose coupling
- Follow SOLID principles
- Write comprehensive tests
- Document complex business logic

## Related Projects

- **Backend API**: [featuresPOC-Lambda](https:github.com/aabbdduurr/featuresPOC-Lambda)
- **Documentation**: Check the `/docs` folder for additional architecture details

## License

This project is open source. Feel free to use it as you like with no restrictions.

## Support

For questions or issues:
1. Check the existing [issues](https:github.com/aabbdduurr/featuresPOC-Management/issues)
2. Create a new issue with detailed description
3. Reference the architecture documentation in `/docs`
