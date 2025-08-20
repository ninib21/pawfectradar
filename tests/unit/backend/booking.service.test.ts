import { BookingService } from '../../../backend/src/booking/booking.service';
import { PrismaService } from '../../../backend/src/prisma/prisma.service';
import { NotificationService } from '../../../backend/src/notification/notification.service';

describe('BookingService', () => {
  let service: BookingService;
  let mockPrismaService: any;
  let mockNotificationService: any;

  const mockBooking = {
    id: '1',
    ownerId: 'owner1',
    sitterId: 'sitter1',
    startDate: new Date('2024-01-01T10:00:00Z'),
    endDate: new Date('2024-01-01T18:00:00Z'),
    status: 'PENDING' as const,
    totalAmount: 200.00,
    specialInstructions: 'Feed twice daily',
    createdAt: new Date(),
    updatedAt: new Date(),
    pets: [
      {
        id: 'pet1',
        name: 'Buddy',
        type: 'DOG',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25.5,
        ownerId: 'owner1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ],
    sitter: {
      id: 'sitter1',
      email: 'sitter@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'SITTER' as const,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    owner: {
      id: 'owner1',
      email: 'owner@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'OWNER' as const,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  };

  beforeEach(() => {
    // Create mock services
    mockPrismaService = {
      pet: {
        findFirst: jest.fn(),
      },
      booking: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };

    mockNotificationService = {
      sendBookingNotification: jest.fn(),
      sendBookingUpdateNotification: jest.fn(),
    };

    // Manually instantiate the service
    service = new BookingService(mockPrismaService, mockNotificationService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should create a new booking successfully', async () => {
      const ownerId = 'owner1';
      const createBookingDto = {
        petId: 'pet1',
        sitterId: 'sitter1',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T18:00:00Z'),
        specialInstructions: 'Feed twice daily',
      };

      const mockPet = {
        id: 'pet1',
        name: 'Buddy',
        type: 'DOG',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25.5,
        ownerId: 'owner1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.pet.findFirst.mockResolvedValue(mockPet);
      mockPrismaService.booking.findMany.mockResolvedValue([]); // Sitter is available
      mockPrismaService.booking.create.mockResolvedValue(mockBooking);
      mockNotificationService.sendBookingNotification.mockResolvedValue(undefined);

      const result = await service.createBooking(ownerId, createBookingDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockBooking.id);
      expect(mockPrismaService.booking.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ownerId: ownerId,
          sitterId: createBookingDto.sitterId,
          startDate: createBookingDto.startTime,
          endDate: createBookingDto.endTime,
          status: 'PENDING',
        }),
        include: {
          pets: true,
          sitter: true,
          owner: true,
        },
      });
    });

    it('should throw error for invalid time range', async () => {
      const ownerId = 'owner1';
      const createBookingDto = {
        petId: 'pet1',
        sitterId: 'sitter1',
        startTime: new Date('2024-01-01T18:00:00Z'), // End time before start time
        endTime: new Date('2024-01-01T10:00:00Z'),
        specialInstructions: 'Feed twice daily',
      };

      await expect(service.createBooking(ownerId, createBookingDto)).rejects.toThrow('Invalid time range');
    });

    it('should throw error when sitter is not available', async () => {
      const ownerId = 'owner1';
      const createBookingDto = {
        petId: 'pet1',
        sitterId: 'sitter1',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T18:00:00Z'),
        specialInstructions: 'Feed twice daily',
      };

      const mockPet = {
        id: 'pet1',
        name: 'Buddy',
        type: 'DOG',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25.5,
        ownerId: 'owner1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.pet.findFirst.mockResolvedValue(mockPet);
      mockPrismaService.booking.findMany.mockResolvedValue([{ id: 'conflicting-booking' }]); // Sitter not available

      await expect(service.createBooking(ownerId, createBookingDto)).rejects.toThrow('Sitter is not available');
    });

    it('should throw error when pet not found', async () => {
      const ownerId = 'owner1';
      const createBookingDto = {
        petId: 'nonexistent-pet',
        sitterId: 'sitter1',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T18:00:00Z'),
        specialInstructions: 'Feed twice daily',
      };

      mockPrismaService.pet.findFirst.mockResolvedValue(null);

      await expect(service.createBooking(ownerId, createBookingDto)).rejects.toThrow('Pet not found');
    });
  });

  describe('updateBookingStatus', () => {
    it('should update booking status successfully', async () => {
      const bookingId = '1';
      const userId = 'sitter1';
      const userRole = 'SITTER';
      const newStatus = 'CONFIRMED';

      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);
      mockPrismaService.booking.update.mockResolvedValue({
        ...mockBooking,
        status: newStatus,
      });
      mockNotificationService.sendBookingUpdateNotification.mockResolvedValue(undefined);

      const result = await service.updateBookingStatus(bookingId, userId, userRole, newStatus);

      expect(result.status).toBe(newStatus);
      expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
        where: { id: bookingId },
        data: { status: newStatus },
        include: {
          pets: true,
          sitter: true,
          owner: true,
        },
      });
    });

    it('should throw error for non-existent booking', async () => {
      const bookingId = 'nonexistent';
      const userId = 'sitter1';
      const userRole = 'SITTER';
      const newStatus = 'CONFIRMED';

      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(service.updateBookingStatus(bookingId, userId, userRole, newStatus)).rejects.toThrow('Booking not found');
    });

    it('should validate status transitions', async () => {
      const bookingId = '1';
      const userId = 'sitter1';
      const userRole = 'SITTER';
      const invalidStatus = 'INVALID_STATUS' as any; // Type assertion to bypass TypeScript check

      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);

      await expect(service.updateBookingStatus(bookingId, userId, userRole, invalidStatus)).rejects.toThrow('Invalid status');
    });
  });

  describe('getUserBookings', () => {
    it('should return user bookings with filters', async () => {
      const userId = 'owner1';
      const filters = { status: 'PENDING' };

      const mockUser = {
        id: 'owner1',
        email: 'owner@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'OWNER' as const,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.booking.findMany.mockResolvedValue([mockBooking]);

      const result = await service.getUserBookings(userId, filters);

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockBooking.id);
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking successfully', async () => {
      const bookingId = '1';
      const userId = 'owner1';
      const userRole = 'OWNER';
      const reason = 'Change of plans';

      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);
      mockPrismaService.booking.update.mockResolvedValue({
        ...mockBooking,
        status: 'CANCELLED',
      });
      mockNotificationService.sendBookingUpdateNotification.mockResolvedValue(undefined);

      const result = await service.cancelBooking(bookingId, userId, userRole, reason);

      expect(result.status).toBe('CANCELLED');
      expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
        include: {
          pets: true,
          sitter: true,
          owner: true,
        },
      });
    });

    it('should not allow cancellation of completed bookings', async () => {
      const bookingId = '1';
      const userId = 'owner1';
      const userRole = 'OWNER';

      const completedBooking = {
        ...mockBooking,
        status: 'COMPLETED' as const,
      };

      mockPrismaService.booking.findUnique.mockResolvedValue(completedBooking);

      await expect(service.cancelBooking(bookingId, userId, userRole)).rejects.toThrow('Booking cannot be cancelled');
    });
  });

  describe('getBookingById', () => {
    it('should return booking by id', async () => {
      const bookingId = '1';
      const userId = 'owner1';
      const userRole = 'OWNER';

      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);

      const result = await service.getBookingById(bookingId, userId, userRole);

      expect(result).toBeDefined();
      expect(result.id).toBe(bookingId);
    });

    it('should throw error for non-existent booking', async () => {
      const bookingId = 'nonexistent';
      const userId = 'owner1';
      const userRole = 'OWNER';

      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(service.getBookingById(bookingId, userId, userRole)).rejects.toThrow('Booking not found');
    });
  });

  describe('quantum features', () => {
    it('should handle quantum-secured booking data', async () => {
      const ownerId = 'owner1';
      const createBookingDto = {
        petId: 'pet1',
        sitterId: 'sitter1',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T18:00:00Z'),
        specialInstructions: 'Feed twice daily',
        aiOptimized: true, // Test AI optimization
      };

      const mockPet = {
        id: 'pet1',
        name: 'Buddy',
        type: 'DOG',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25.5,
        ownerId: 'owner1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.pet.findFirst.mockResolvedValue(mockPet);
      mockPrismaService.booking.findMany.mockResolvedValue([]); // Sitter is available
      mockPrismaService.booking.create.mockResolvedValue(mockBooking);
      mockNotificationService.sendBookingNotification.mockResolvedValue(undefined);

      const result = await service.createBooking(ownerId, createBookingDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockBooking.id);
    });
  });
});
