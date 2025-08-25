
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let authService: AuthService;
  let mockPrismaService: jest.Mocked<PrismaService>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn().mockResolvedValue(mockUser),
              findUnique: jest.fn().mockResolvedValue(mockUser),
              update: jest.fn(),
              findMany: jest.fn(),
              delete: jest.fn(),
            },
            booking: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            pet: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            $connect: jest.fn(),
            $disconnect: jest.fn(),
            $on: jest.fn(),
            $use: jest.fn(),
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    mockPrismaService = moduleFixture.get<PrismaService>(PrismaService) as jest.Mocked<PrismaService>;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Flow', () => {
    it('should handle user registration and login flow', async () => {
      // Test registration
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const registeredUser = await authService.register(registerDto);
      expect(registeredUser).toBeDefined();
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User'
        }
      });

      // Test login
      const loginDto = {
        email: 'test@example.com',
        password: 'password123'
      };

      const loginResult = await authService.login(loginDto);
      expect(loginResult).toHaveProperty('accessToken');
      expect(loginResult).toHaveProperty('refreshToken');
      expect(loginResult).toHaveProperty('user');
    });

    it('should handle token verification', async () => {
      const isValid = await authService.verifyToken('valid-token');
      expect(isValid).toBe(true);
    });

    it('should handle logout', async () => {
      const result = await authService.logout('test-token');
      expect(result).toBe(true);
    });
  });
});
