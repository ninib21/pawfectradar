# 🧪 Testing Guide for PawfectRadar Backend

## 📋 Testing Overview

The PawfectRadar backend includes comprehensive testing at multiple levels:

- **Unit Tests**: Individual function and service testing
- **Integration Tests**: API endpoint and database integration testing
- **E2E Tests**: Complete user flow testing
- **Performance Tests**: Load and stress testing

## 🚀 Quick Start (Without Docker)

### 1. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install global testing tools
npm install -g jest @nestjs/testing
```

### 2. Set Up Test Environment
```bash
# Copy test environment file
cp env.example .env.test

# Update test environment variables
DATABASE_URL="postgresql://test_user:test_pass@localhost:5432/pawfectradar_test"
NODE_ENV="test"
```

### 3. Run Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.service.spec.ts

# Run integration tests
npm run test:e2e
```

## 📊 Test Categories

### Unit Tests
Test individual functions and services in isolation:

```bash
# Test authentication service
npm test -- auth.service.spec.ts

# Test user service
npm test -- user.service.spec.ts

# Test booking service
npm test -- booking.service.spec.ts

# Test payment service
npm test -- payment.service.spec.ts
```

### Integration Tests
Test API endpoints and database interactions:

```bash
# Test auth endpoints
npm test -- auth.integration.spec.ts

# Test user endpoints
npm test -- user.integration.spec.ts

# Test booking endpoints
npm test -- booking.integration.spec.ts

# Test payment endpoints
npm test -- payment.integration.spec.ts
```

### E2E Tests
Test complete user flows:

```bash
# Test user registration flow
npm test -- registration.e2e.spec.ts

# Test booking flow
npm test -- booking.e2e.spec.ts

# Test payment flow
npm test -- payment.e2e.spec.ts
```

## 🔧 Test Configuration

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
```

### Test Database Setup
```bash
# Create test database
createdb pawfectradar_test

# Run migrations for test database
DATABASE_URL="postgresql://localhost:5432/pawfectradar_test" npm run db:migrate

# Seed test data
DATABASE_URL="postgresql://localhost:5432/pawfectradar_test" npm run db:seed
```

## 📈 Test Coverage

### Coverage Goals
- **Unit Tests**: 90%+ coverage
- **Integration Tests**: 80%+ coverage
- **E2E Tests**: Critical user flows

### Generate Coverage Report
```bash
# Run tests with coverage
npm run test:cov

# Open coverage report
open coverage/lcov-report/index.html
```

## 🧪 Test Examples

### Unit Test Example
```typescript
// auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual(mockUser);
    });
  });
});
```

### Integration Test Example
```typescript
// auth.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toBe('test@example.com');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## 🔍 Manual Testing

### API Testing with Postman/Insomnia
1. **Import Collection**: Use the provided Postman collection
2. **Set Environment Variables**: Configure base URL and auth tokens
3. **Test Endpoints**: Run through all API endpoints

### Database Testing
```bash
# Connect to database
psql -h localhost -U username -d pawfectradar

# Run test queries
SELECT * FROM users LIMIT 5;
SELECT * FROM bookings LIMIT 5;
SELECT * FROM payments LIMIT 5;
```

## 🚨 Common Test Issues

### 1. Database Connection
```bash
# Check database is running
pg_isready -h localhost -p 5432

# Reset test database
dropdb pawfectradar_test
createdb pawfectradar_test
```

### 2. Environment Variables
```bash
# Check environment variables are loaded
echo $DATABASE_URL
echo $NODE_ENV

# Set test environment
export NODE_ENV=test
export DATABASE_URL="postgresql://localhost:5432/pawfectradar_test"
```

### 3. Port Conflicts
```bash
# Check if port is in use
lsof -i :3001
netstat -ano | findstr :3001

# Kill process using port
kill -9 <PID>
```

## 📊 Performance Testing

### Load Testing with Artillery
```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run load-test.yml

# Generate report
artillery run --output report.json load-test.yml
artillery report report.json
```

### Load Test Configuration
```yaml
# load-test.yml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: 'API Load Test'
    requests:
      - get: '/health'
      - post: '/auth/login'
        json:
          email: 'test@example.com'
          password: 'password123'
```

## 🎯 Test Checklist

### Pre-Testing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Test data seeded
- [ ] Dependencies installed

### Unit Tests
- [ ] All services tested
- [ ] All controllers tested
- [ ] All guards tested
- [ ] All interceptors tested

### Integration Tests
- [ ] All API endpoints tested
- [ ] Database operations tested
- [ ] Authentication flow tested
- [ ] Error handling tested

### E2E Tests
- [ ] User registration flow
- [ ] User login flow
- [ ] Booking creation flow
- [ ] Payment processing flow

### Performance Tests
- [ ] Load testing completed
- [ ] Stress testing completed
- [ ] Response times acceptable
- [ ] Error rates acceptable

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Artillery Documentation](https://www.artillery.io/docs/)
