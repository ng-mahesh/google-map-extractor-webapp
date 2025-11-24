# Testing Guide

## Overview

This project includes comprehensive automated tests for both backend and frontend to ensure code quality and prevent regressions.

## Backend Testing

### Test Structure

```
backend/
├── src/
│   ├── auth/
│   │   └── auth.service.spec.ts          # Auth service unit tests
│   ├── users/
│   │   └── users.service.spec.ts         # Users service unit tests
│   └── scraper/
│       └── scraper.service.spec.ts       # Scraper service unit tests
└── test/
    ├── test-db.ts                         # Test database helper
    └── auth.e2e-spec.ts                   # Auth E2E tests
```

### Running Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests only
npm run test:e2e
```

### Test Coverage

Current test coverage:

- **Auth Service:** 11 unit tests
- **Users Service:** 14 unit tests
- **Scraper Service:** 8 unit tests
- **Auth E2E:** 10 integration tests

**Total:** 43 tests

### Writing New Tests

#### Unit Test Example

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { YourService } from "./your.service";

describe("YourService", () => {
  let service: YourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YourService],
    }).compile();

    service = module.get<YourService>(YourService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
```

#### E2E Test Example

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";

describe("YourController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/api/your-endpoint (GET)", () => {
    return request(app.getHttpServer()).get("/api/your-endpoint").expect(200);
  });
});
```

### Test Database

Tests use `mongodb-memory-server` for in-memory MongoDB testing:

- No external MongoDB required
- Fast test execution
- Isolated test environment
- Automatic cleanup

### Mocking

#### Mocking Services

```typescript
{
  provide: YourService,
  useValue: {
    method: jest.fn(),
  },
}
```

#### Mocking Mongoose Models

```typescript
{
  provide: getModelToken(User.name),
  useValue: mockUserModel,
}
```

## Frontend Testing (Coming Soon)

Frontend tests will be added in Phase 2 using:

- React Testing Library
- Jest
- MSW (Mock Service Worker)

## CI/CD Integration

Tests run automatically on:

- Pull requests
- Pushes to `develop` and `master` branches

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend && npm ci
      - run: cd backend && npm test
```

## Best Practices

### 1. Test Naming

Use descriptive test names that explain what is being tested:

```typescript
it("should return user profile when valid token is provided", () => {
  // test code
});
```

### 2. Test Organization

Group related tests using `describe` blocks:

```typescript
describe("AuthService", () => {
  describe("register", () => {
    it("should create new user", () => {});
    it("should hash password", () => {});
  });

  describe("login", () => {
    it("should return JWT token", () => {});
  });
});
```

### 3. Test Isolation

Each test should be independent:

```typescript
beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();
});
```

### 4. Arrange-Act-Assert Pattern

```typescript
it("should do something", () => {
  // Arrange
  const input = "test";
  const expected = "TEST";

  // Act
  const result = service.transform(input);

  // Assert
  expect(result).toBe(expected);
});
```

## Troubleshooting

### Tests Failing Locally

1. **Clear Jest cache:**

   ```bash
   npm test -- --clearCache
   ```

2. **Update snapshots:**

   ```bash
   npm test -- -u
   ```

3. **Run specific test file:**
   ```bash
   npm test -- auth.service.spec.ts
   ```

### MongoDB Memory Server Issues

If you encounter issues with mongodb-memory-server:

```bash
# Clear cache
rm -rf ~/.cache/mongodb-memory-server

# Reinstall
npm install mongodb-memory-server --force
```

### Timeout Issues

Increase Jest timeout for slow tests:

```typescript
jest.setTimeout(30000); // 30 seconds
```

## Coverage Goals

- **Services:** >80% coverage
- **Controllers:** >70% coverage
- **Overall:** >70% coverage

View coverage report:

```bash
npm run test:cov
open coverage/lcov-report/index.html
```

## Next Steps

### Phase 2: Frontend Tests

- [ ] Install React Testing Library
- [ ] Configure Jest for Next.js
- [ ] Create component tests
- [ ] Create integration tests

### Phase 3: E2E Tests

- [ ] Install Playwright
- [ ] Create user journey tests
- [ ] Test error scenarios
- [ ] Add visual regression tests

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright](https://playwright.dev/)

## Support

For questions or issues with tests:

1. Check this guide
2. Review existing test files
3. Create an issue on GitHub
