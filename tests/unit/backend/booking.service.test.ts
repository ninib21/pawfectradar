import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from '../../backend/src/booking/booking.service';
import { PrismaService } from '../../backend/src/prisma/prisma.service';
import { NotificationService } from '../../backend/src/notification/notification.service';

describe('BookingService', () => {
  let service: BookingService;
  let prismaService: PrismaService;
  let notificationService: NotificationService;

  const mockBooking = {
    id: '1',
    ownerId: 'owner1',
    sitterId: 'sitter1',
    petIds: ['pet1', 'pet2'],
    startTime: new Date('2024-01-15T10:00:00Z'),
    endTime: new Date('2024-01-15T18:00:00Z'),
    status: 'pending' as const,
    totalAmount: 150.00,
    currency: 'USD',
    location: {
      address: '123 Main St',
      latitude: 40.7128,
      longitude: -74.0060
    },
    specialInstructions: 'Feed at 2 PM',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockOwner = {
    id: 'owner1',
    email: 'owner@example.com',
    role: 'owner' as const
  };

  const mockSitter = {
    id: 'sitter1',
    email: 'sitter@example.com',
    role: 'sitter' as const,
    hourlyRate: 25.00
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: PrismaService,
          useValue: {
            booking: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn()
            },
            user: {
              findUnique: jest.fn()
            },
            pet: {
              findMany: jest.fn()
            }
          }
        },
        {
          provide: NotificationService,
          useValue: {
            sendBookingNotification: jest.fn(),
            sendBookingUpdateNotification: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  describe('createBooking', () => {
    it('should create a new booking successfully', async () => {
      const createBookingDto = {
        ownerId: 'owner1',
        sitterId: 'sitter1',
        petIds: ['pet1', 'pet2'],
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T18:00:00Z'),
        location: {
          address: '123 Main St',
          latitude: 40.7128,
          longitude: -74.0060
        },
        specialInstructions: 'Feed at 2 PM'
      };

      jest.spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(mockOwner)
        .mockResolvedValueOnce(mockSitter);
      jest.spyOn(prismaService.booking, 'create').mockResolvedValue(mockBooking);
      jest.spyOn(notificationService, 'sendBookingNotification').mockResolvedValue();

      const result = await service.createBooking(createBookingDto);

      expect(result).toBeDefined();
      expect(result.ownerId).toBe(createBookingDto.ownerId);
      expect(result.sitterId).toBe(createBookingDto.sitterId);
      expect(result.status).toBe('pending');
      expect(notificationService.sendBookingNotification).toHaveBeenCalled();
    });

    it('should calculate total amount based on duration and hourly rate', async () => {
      const createBookingDto = {
        ownerId: 'owner1',
        sitterId: 'sitter1',
        petIds: ['pet1'],
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T18:00:00Z'),
        location: {
          address: '123 Main St',
          latitude: 40.7128,
          longitude: -74.0060
        }
      };

      jest.spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(mockOwner)
        .mockResolvedValueOnce(mockSitter);
      jest.spyOn(prismaService.booking, 'create').mockResolvedValue(mockBooking);

      const result = await service.createBooking(createBookingDto);

      expect(result.totalAmount).toBe(200.00); // 8 hours * $25/hour
    });

    it('should throw error for invalid time range', async () => {
      const createBookingDto = {
        ownerId: 'owner1',
        sitterId: 'sitter1',
        petIds: ['pet1'],
        startTime: new Date('2024-01-15T18:00:00Z'),
        endTime: new Date('2024-01-15T10:00:00Z'), // End before start
        location: {
          address: '123 Main St',
          latitude: 40.7128,
          longitude: -74.0060
        }
      };

      await expect(service.createBooking(createBookingDto)).rejects.toThrow('Invalid time range');
    });
  });

  describe('updateBookingStatus', () => {
    it('should update booking status successfully', async () => {
      const bookingId = '1';
      const newStatus = 'confirmed' as const;
      const updatedBooking = { ...mockBooking, status: newStatus };

      jest.spyOn(prismaService.booking, 'findUnique').mockResolvedValue(mockBooking);
      jest.spyOn(prismaService.booking, 'update').mockResolvedValue(updatedBooking);
      jest.spyOn(notificationService, 'sendBookingUpdateNotification').mockResolvedValue();

      const result = await service.updateBookingStatus(bookingId, newStatus);

      expect(result.status).toBe(newStatus);
      expect(notificationService.sendBookingUpdateNotification).toHaveBeenCalled();
    });

    it('should throw error for non-existent booking', async () => {
      const bookingId = 'nonexistent';
      const newStatus = 'confirmed' as const;

      jest.spyOn(prismaService.booking, 'findUnique').mockResolvedValue(null);

      await expect(service.updateBookingStatus(bookingId, newStatus)).rejects.toThrow('Booking not found');
    });

    it('should validate status transitions', async () => {
      const bookingId = '1';
      const invalidStatus = 'invalid_status' as any;

      jest.spyOn(prismaService.booking, 'findUnique').mockResolvedValue(mockBooking);

      await expect(service.updateBookingStatus(bookingId, invalidStatus)).rejects.toThrow('Invalid status');
    });
  });

  describe('getUserBookings', () => {
    it('should return user bookings with filters', async () => {
      const userId = 'owner1';
      const filters = { status: 'pending' as const };

      jest.spyOn(prismaService.booking, 'findMany').mockResolvedValue([mockBooking]);

      const result = await service.getUserBookings(userId, filters);

      expect(result).toHaveLength(1);
      expect(result[0].ownerId).toBe(userId);
      expect(prismaService.booking.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { ownerId: userId },
            { sitterId: userId }
          ],
          status: filters.status
        },
        include: {
          owner: true,
          sitter: true,
          pets: true
        }
      });
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking successfully', async () => {
      const bookingId = '1';
      const cancelledBooking = { ...mockBooking, status: 'cancelled' as const };

      jest.spyOn(prismaService.booking, 'findUnique').mockResolvedValue(mockBooking);
      jest.spyOn(prismaService.booking, 'update').mockResolvedValue(cancelledBooking);
      jest.spyOn(notificationService, 'sendBookingUpdateNotification').mockResolvedValue();

      const result = await service.cancelBooking(bookingId);

      expect(result.status).toBe('cancelled');
      expect(notificationService.sendBookingUpdateNotification).toHaveBeenCalled();
    });

    it('should not allow cancellation of completed bookings', async () => {
      const bookingId = '1';
      const completedBooking = { ...mockBooking, status: 'completed' as const };

      jest.spyOn(prismaService.booking, 'findUnique').mockResolvedValue(completedBooking);

      await expect(service.cancelBooking(bookingId)).rejects.toThrow('Cannot cancel completed booking');
    });
  });

  describe('quantum features', () => {
    it('should handle quantum-encrypted booking data', async () => {
      const createBookingDto = {
        ownerId: 'owner1',
        sitterId: 'sitter1',
        petIds: ['pet1'],
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T18:00:00Z'),
        location: {
          address: '123 Main St',
          latitude: 40.7128,
          longitude: -74.0060
        },
        quantumEncrypted: true
      };

      jest.spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(mockOwner)
        .mockResolvedValueOnce(mockSitter);
      jest.spyOn(prismaService.booking, 'create').mockResolvedValue({
        ...mockBooking,
        quantumEncrypted: true
      });

      const result = await service.createBooking(createBookingDto);

      expect(result.quantumEncrypted).toBe(true);
    });
  });
});
