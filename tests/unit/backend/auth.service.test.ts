import { AuthService } from '../../../backend/src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../backend/src/prisma/prisma.service';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn()
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let mockPrismaService: any;
  let mockJwtService: any;

  beforeEach(() => {
    // Create mock services
    mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      },
      biometricToken: {
        create: jest.fn(),
        findFirst: jest.fn()
      }
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
      verify: jest.fn().mockReturnValue({ userId: '1' }),
      verifyAsync: jest.fn().mockResolvedValue({ sub: '1' })
    };

    // Manually instantiate the service
    service = new AuthService(mockPrismaService, mockJwtService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  // Add a simple test to verify service instantiation
  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service['prisma']).toBeDefined();
    expect(service['jwtService']).toBeDefined();
  });

  describe('login', () => {
    it('should generate JWT token for valid user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'OWNER' as const,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(mockUser.email);
    });

    it('should throw error for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should create new user with hashed password', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'newpassword123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'OWNER' as const
      };

      const mockUser = {
        id: '1',
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'OWNER' as const,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: registerDto.email.toLowerCase(),
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          role: 'OWNER'
        })
      });
    });

    it('should throw error for existing user', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'OWNER' as const
      };

      const mockUser = {
        id: '1',
        email: 'existing@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'OWNER' as const,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow('User with this email already exists');
    });
  });
});
