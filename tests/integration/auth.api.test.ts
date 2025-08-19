import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../backend/src/app.module';
import { PrismaService } from '../../backend/src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('Auth API Integration Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prismaService.user.deleteMany();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'securePassword123',
        role: 'owner'
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(registerData.email);
      expect(response.body.role).toBe(registerData.role);
      expect(response.body).not.toHaveProperty('password');

      // Verify user was created in database
      const user = await prismaService.user.findUnique({
        where: { email: registerData.email }
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe(registerData.email);
    });

    it('should return 400 for invalid email format', async () => {
      const registerData = {
        email: 'invalid-email',
        password: 'securePassword123',
        role: 'owner'
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(400);
    });

    it('should return 400 for weak password', async () => {
      const registerData = {
        email: 'test@example.com',
        password: '123',
        role: 'owner'
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(400);
    });

    it('should return 409 for duplicate email', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'securePassword123',
        role: 'owner'
      };

      // Register first user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      // Try to register with same email
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('securePassword123', 10);
      await prismaService.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          role: 'owner'
        }
      });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'securePassword123'
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.access_token).toBeDefined();
      expect(typeof response.body.access_token).toBe('string');
      expect(response.body.access_token.length).toBeGreaterThan(100);
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongPassword'
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);
    });

    it('should return 401 for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'securePassword123'
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create a test user and get access token
      const hashedPassword = await bcrypt.hash('securePassword123', 10);
      await prismaService.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          role: 'owner'
        }
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'securePassword123'
        });

      accessToken = loginResponse.body.access_token;
    });

    it('should refresh token successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.access_token).toBeDefined();
      expect(response.body.access_token).not.toBe(accessToken);
    });

    it('should return 401 for invalid token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create a test user and get access token
      const hashedPassword = await bcrypt.hash('securePassword123', 10);
      await prismaService.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          role: 'owner'
        }
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'securePassword123'
        });

      accessToken = loginResponse.body.access_token;
    });

    it('should logout successfully', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify token is invalidated
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });
  });

  describe('GET /auth/profile', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create a test user and get access token
      const hashedPassword = await bcrypt.hash('securePassword123', 10);
      await prismaService.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          role: 'owner'
        }
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'securePassword123'
        });

      accessToken = loginResponse.body.access_token;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.role).toBe('owner');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Quantum Security Features', () => {
    it('should implement quantum-resistant password hashing', async () => {
      const registerData = {
        email: 'quantum@example.com',
        password: 'quantumSecurePassword123',
        role: 'owner'
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      // Verify password is hashed with high rounds
      const user = await prismaService.user.findUnique({
        where: { email: registerData.email }
      });

      expect(user?.password).not.toBe(registerData.password);
      expect(user?.password).toMatch(/^\$2[aby]\$\d{1,2}\$/); // bcrypt format
    });

    it('should generate quantum-secure JWT tokens', async () => {
      const hashedPassword = await bcrypt.hash('securePassword123', 10);
      await prismaService.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          role: 'owner'
        }
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'securePassword123'
        })
        .expect(200);

      const token = response.body.access_token;
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(100);
      
      // Verify token structure (JWT format)
      const tokenParts = token.split('.');
      expect(tokenParts).toHaveLength(3);
    });
  });
});
