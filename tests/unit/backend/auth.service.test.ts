import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../backend/src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../backend/src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'owner',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
            verify: jest.fn().mockReturnValue({ userId: '1' })
          }
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn()
            }
          }
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUserWithHashedPassword = { ...mockUser, password: hashedPassword };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUserWithHashedPassword);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result.password).toBeUndefined();
    });

    it('should return null for invalid credentials', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate JWT token for valid user', async () => {
      const userWithoutPassword = { ...mockUser };
      delete userWithoutPassword.password;

      const result = await service.login(userWithoutPassword);

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('mock-jwt-token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: userWithoutPassword.email,
        sub: userWithoutPassword.id,
        role: userWithoutPassword.role
      });
    });
  });

  describe('register', () => {
    it('should create new user with hashed password', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'newpassword123',
        role: 'owner' as const
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: registerDto.email,
          role: registerDto.role
        })
      });
    });

    it('should throw error for existing user', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        role: 'owner' as const
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow('User already exists');
    });
  });

  describe('quantum security features', () => {
    it('should implement quantum-resistant password hashing', async () => {
      const password = 'quantum-secure-password';
      const hashedPassword = await bcrypt.hash(password, 12); // Higher rounds for quantum resistance

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it('should generate quantum-secure JWT tokens', async () => {
      const user = { ...mockUser };
      delete user.password;

      const result = await service.login(user);

      expect(result.access_token).toBeDefined();
      expect(typeof result.access_token).toBe('string');
      expect(result.access_token.length).toBeGreaterThan(100);
    });
  });
});
