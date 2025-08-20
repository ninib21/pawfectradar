import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

export interface CreateBookingDto {
  ownerId: string;
  sitterId: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  hourlyRate: number;
  location: string;
  specialInstructions?: string;
  petIds: string[];
}

export interface UpdateBookingDto {
  startDate?: Date;
  endDate?: Date;
  totalAmount?: number;
  specialInstructions?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async findAll() {
    try {
      const bookings = await this.prisma.booking.findMany({
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          sitter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          pets: {
            select: {
              id: true,
              name: true,
              type: true,
              breed: true,
            },
          },
        },
      });
      return bookings;
    } catch (error) {
      console.error('🔒 QUANTUM BOOKINGS: Error fetching bookings:', error);
      throw new Error('Failed to fetch bookings');
    }
  }

  async findById(id: string) {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          sitter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          pets: {
            select: {
              id: true,
              name: true,
              type: true,
              breed: true,
            },
          },
        },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      return booking;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('🔒 QUANTUM BOOKINGS: Error fetching booking:', error);
      throw new Error('Failed to fetch booking');
    }
  }

  async findByOwnerId(ownerId: string) {
    try {
      const bookings = await this.prisma.booking.findMany({
        where: { ownerId },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          sitter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          pets: {
            select: {
              id: true,
              name: true,
              type: true,
              breed: true,
            },
          },
        },
      });
      return bookings;
    } catch (error) {
      console.error('🔒 QUANTUM BOOKINGS: Error fetching bookings by owner:', error);
      throw new Error('Failed to fetch bookings by owner');
    }
  }

  async findBySitterId(sitterId: string) {
    try {
      const bookings = await this.prisma.booking.findMany({
        where: { sitterId },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          sitter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          pets: {
            select: {
              id: true,
              name: true,
              type: true,
              breed: true,
            },
          },
        },
      });
      return bookings;
    } catch (error) {
      console.error('🔒 QUANTUM BOOKINGS: Error fetching bookings by sitter:', error);
      throw new Error('Failed to fetch bookings by sitter');
    }
  }

  async create(createBookingDto: CreateBookingDto) {
    try {
      // Verify owner exists and is an owner
      const owner = await this.prisma.user.findUnique({
        where: { id: createBookingDto.ownerId },
      });

      if (!owner || owner.role !== 'OWNER') {
        throw new BadRequestException('Invalid owner');
      }

      // Verify sitter exists and is a sitter
      const sitter = await this.prisma.user.findUnique({
        where: { id: createBookingDto.sitterId },
      });

      if (!sitter || sitter.role !== 'SITTER') {
        throw new BadRequestException('Invalid sitter');
      }

      // Verify pets exist and belong to the owner
      for (const petId of createBookingDto.petIds) {
        const pet = await this.prisma.pet.findFirst({
          where: { id: petId, ownerId: createBookingDto.ownerId },
        });

        if (!pet) {
          throw new BadRequestException(`Pet ${petId} not found or doesn't belong to owner`);
        }
      }

      // Check if sitter is available for the selected time
      const conflictingBooking = await this.prisma.booking.findFirst({
        where: {
          sitterId: createBookingDto.sitterId,
          status: {
            in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
          },
          OR: [
            {
              startDate: {
                lte: createBookingDto.endDate,
                gte: createBookingDto.startDate,
              },
            },
            {
              endDate: {
                gte: createBookingDto.startDate,
                lte: createBookingDto.endDate,
              },
            },
          ],
        },
      });

      if (conflictingBooking) {
        throw new BadRequestException('Sitter is not available for the selected time');
      }

      const booking = await this.prisma.booking.create({
        data: {
          owner: { connect: { id: createBookingDto.ownerId } },
          sitter: { connect: { id: createBookingDto.sitterId } },
          startDate: createBookingDto.startDate,
          endDate: createBookingDto.endDate,
          totalAmount: createBookingDto.totalAmount,
          hourlyRate: createBookingDto.hourlyRate,
          location: createBookingDto.location,
          specialInstructions: createBookingDto.specialInstructions,
          status: 'PENDING',
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          sitter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          pets: {
            select: {
              id: true,
              name: true,
              type: true,
              breed: true,
            },
          },
        },
      });

      // Send notification to sitter
      await this.notificationService.sendBookingNotification({
        type: 'booking_confirmed',
        bookingId: booking.id,
        recipientId: booking.sitterId,
        data: {
          petName: 'Pet', // Mock pet name since pets relation is not loaded
          startTime: booking.startDate,
          endTime: booking.endDate,
          totalPrice: booking.totalAmount,
        },
      });

      console.log('🔒 QUANTUM BOOKINGS: Booking created successfully:', booking.id);
      return booking;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('🔒 QUANTUM BOOKINGS: Error creating booking:', error);
      throw new Error('Failed to create booking');
    }
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    try {
      const booking = await this.prisma.booking.update({
        where: { id },
        data: updateBookingDto,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          sitter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          pets: {
            select: {
              id: true,
              name: true,
              type: true,
              breed: true,
            },
          },
        },
      });

      // Send notification about booking update
      if (updateBookingDto.status) {
        await this.notificationService.sendBookingUpdateNotification({
          type: 'booking_status_updated',
          bookingId: booking.id,
          recipientId: booking.ownerId,
          data: {
            status: updateBookingDto.status,
            petName: booking.pets[0]?.name || 'Pet',
            startTime: booking.startDate,
            endTime: booking.endDate,
          },
        });
      }

      console.log('🔒 QUANTUM BOOKINGS: Booking updated successfully:', booking.id);
      return booking;
    } catch (error) {
      console.error('🔒 QUANTUM BOOKINGS: Error updating booking:', error);
      throw new Error('Failed to update booking');
    }
  }

  async updateStatus(id: string, status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') {
    try {
      const booking = await this.prisma.booking.update({
        where: { id },
        data: { status },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          sitter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          pets: {
            select: {
              id: true,
              name: true,
              type: true,
              breed: true,
            },
          },
        },
      });

      // Send notification about status change
      await this.notificationService.sendBookingUpdateNotification({
        type: 'booking_status_updated',
        bookingId: booking.id,
        recipientId: status === 'CANCELLED' ? booking.sitterId : booking.ownerId,
        data: {
          status: status,
          petName: booking.pets[0]?.name || 'Pet',
          startTime: booking.startDate,
          endTime: booking.endDate,
        },
      });

      console.log('🔒 QUANTUM BOOKINGS: Booking status updated successfully:', booking.id);
      return booking;
    } catch (error) {
      console.error('🔒 QUANTUM BOOKINGS: Error updating booking status:', error);
      throw new Error('Failed to update booking status');
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.booking.delete({
        where: { id },
      });

      console.log('🔒 QUANTUM BOOKINGS: Booking deleted successfully:', id);
      return { message: 'Booking deleted successfully' };
    } catch (error) {
      console.error('🔒 QUANTUM BOOKINGS: Error deleting booking:', error);
      throw new Error('Failed to delete booking');
    }
  }

  async findByStatus(status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') {
    try {
      const bookings = await this.prisma.booking.findMany({
        where: { status },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          sitter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          pets: {
            select: {
              id: true,
              name: true,
              type: true,
              breed: true,
            },
          },
        },
      });
      return bookings;
    } catch (error) {
      console.error('🔒 QUANTUM BOOKINGS: Error fetching bookings by status:', error);
      throw new Error('Failed to fetch bookings by status');
    }
  }
}
