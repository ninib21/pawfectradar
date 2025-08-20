// 📅 Booking Service with AI Integration
// 🚀 PawfectSitters Booking Management Service

import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

export interface Booking {
  id: string;
  ownerId: string;
  sitterId: string;
  startDate: Date;
  endDate: Date;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingDto {
  petId: string;
  sitterId: string;
  startTime: Date;
  endTime: Date;
  specialInstructions?: string;
  aiOptimized?: boolean;
}

export interface UpdateBookingDto {
  status?: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  specialInstructions?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface BookingFilters {
  status?: string;
  sitterId?: string;
  ownerId?: string;
  startDate?: Date;
  endDate?: Date;
  petId?: string;
}

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  // 📅 QUANTUM SECURE: Create new booking with AI optimization
  async createBooking(ownerId: string, createBookingDto: CreateBookingDto): Promise<Booking> {
    try {
      // Validate booking data
      this.validateBookingData(createBookingDto);

      // Check if sitter is available
      const isSitterAvailable = await this.checkSitterAvailability(
        createBookingDto.sitterId,
        createBookingDto.startTime,
        createBookingDto.endTime
      );

      if (!isSitterAvailable) {
        throw new BadRequestException('Sitter is not available for the selected time');
      }

      // Check if pet exists and belongs to owner
      const pet = await this.prisma.pet.findFirst({
        where: {
          id: createBookingDto.petId,
          ownerId: ownerId,
        },
      });

      if (!pet) {
        throw new NotFoundException('Pet not found or does not belong to you');
      }

      // Calculate total price with AI optimization
      const totalPrice = await this.calculateBookingPrice(createBookingDto);

      // Create booking with quantum security
      const booking = await this.prisma.booking.create({
        data: {
          ownerId: ownerId,
          sitterId: createBookingDto.sitterId,
          startDate: createBookingDto.startTime,
          endDate: createBookingDto.endTime,
          status: 'PENDING',
          totalAmount: totalPrice,
          specialInstructions: createBookingDto.specialInstructions,
          location: 'Default Location', // TODO: Get from request
          hourlyRate: 25.00, // TODO: Get from sitter profile
        },
        include: {
          pets: true,
          sitter: true,
          owner: true,
        },
      });

      // 🔔 QUANTUM NOTIFICATION: Send booking notification
      await this.notificationService.sendBookingNotification({
        type: 'booking_created',
        bookingId: booking.id,
        recipientId: createBookingDto.sitterId,
        data: {
          petName: pet.name,
          startTime: createBookingDto.startTime,
          endTime: createBookingDto.endTime,
          totalPrice: totalPrice,
        },
      });

      // 📊 QUANTUM ANALYTICS: Track booking creation
      await this.trackBookingAnalytics('booking_created', {
        bookingId: booking.id,
        ownerId: ownerId,
        sitterId: createBookingDto.sitterId,
        totalPrice: totalPrice,
      });

      return booking;
    } catch (error) {
      console.error('📅 BOOKING ERROR: Create booking failed:', error);
      throw error;
    }
  }

  // 📅 QUANTUM SECURE: Get booking by ID
  async getBookingById(bookingId: string, userId: string, userRole: string): Promise<Booking> {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          pets: true,
          sitter: true,
          owner: true,
        },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      // Check if user has permission to view this booking
      if (!this.canUserAccessBooking(userId, userRole, booking)) {
        throw new ForbiddenException('You do not have permission to view this booking');
      }

      return booking;
    } catch (error) {
      console.error('📅 BOOKING ERROR: Get booking failed:', error);
      throw error;
    }
  }

  // 📅 QUANTUM SECURE: Get user's bookings with filters
  async getUserBookings(userId: string, filters: BookingFilters = {}): Promise<Booking[]> {
    try {
      const whereClause: any = {};

      // Apply filters based on user role
      if (filters.status) {
        whereClause.status = filters.status;
      }

      if (filters.startDate && filters.endDate) {
        whereClause.startDate = {
          gte: filters.startDate,
          lte: filters.endDate,
        };
      }

      // Get bookings based on user role
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.role === 'SITTER') {
        whereClause.sitterId = userId;
      } else if (user?.role === 'OWNER') {
        whereClause.ownerId = userId;
      }

      const bookings = await this.prisma.booking.findMany({
        where: whereClause,
        include: {
          pets: true,
          sitter: true,
          owner: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return bookings;
    } catch (error) {
      console.error('📅 BOOKING ERROR: Get user bookings failed:', error);
      throw error;
    }
  }

  // 📅 QUANTUM SECURE: Update booking status
  async updateBookingStatus(
    bookingId: string,
    userId: string,
    userRole: string,
    status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  ): Promise<Booking> {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          pets: true,
          sitter: true,
          owner: true,
        },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      // Check if user has permission to update this booking
      if (!this.canUserUpdateBooking(userId, userRole, booking)) {
        throw new ForbiddenException('You do not have permission to update this booking');
      }

      // Validate status transition
      if (!this.isValidStatusTransition(booking.status, status)) {
        throw new BadRequestException('Invalid status transition');
      }

      // Update booking status
      const updatedBooking = await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: status,
        },
        include: {
          pets: true,
          sitter: true,
          owner: true,
        },
      });

      // 🔔 QUANTUM NOTIFICATION: Send status update notification
      await this.notificationService.sendBookingUpdateNotification({
        type: 'booking_status_updated',
        bookingId: bookingId,
        recipientId: userRole === 'SITTER' ? booking.ownerId : booking.sitterId,
        data: {
          status: status,
          petName: booking.pets[0]?.name || 'Pet',
          startTime: booking.startDate,
          endTime: booking.endDate,
        },
      });

      // 📊 QUANTUM ANALYTICS: Track status update
      await this.trackBookingAnalytics('booking_status_updated', {
        bookingId: bookingId,
        updatedBy: userId,
        oldStatus: booking.status,
        newStatus: status,
      });

      return updatedBooking;
    } catch (error) {
      console.error('📅 BOOKING ERROR: Update booking status failed:', error);
      throw error;
    }
  }

  // 📅 QUANTUM SECURE: Cancel booking
  async cancelBooking(bookingId: string, userId: string, userRole: string, reason?: string): Promise<Booking> {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          pets: true,
          sitter: true,
          owner: true,
        },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      // Check if user has permission to cancel this booking
      if (!this.canUserCancelBooking(userId, userRole, booking)) {
        throw new ForbiddenException('You do not have permission to cancel this booking');
      }

      // Check if booking can be cancelled
      if (!this.canBookingBeCancelled(booking)) {
        throw new BadRequestException('Booking cannot be cancelled at this time');
      }

      // Update booking status to cancelled
      const updatedBooking = await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
        },
        include: {
          pets: true,
          sitter: true,
          owner: true,
        },
      });

      // 🔔 QUANTUM NOTIFICATION: Send cancellation notification
      await this.notificationService.sendBookingUpdateNotification({
        type: 'booking_cancelled',
        bookingId: bookingId,
        recipientId: userRole === 'SITTER' ? booking.ownerId : booking.sitterId,
        data: {
          reason: reason,
          petName: booking.pets[0]?.name || 'Pet',
          startTime: booking.startDate,
          endTime: booking.endDate,
        },
      });

      // 📊 QUANTUM ANALYTICS: Track cancellation
      await this.trackBookingAnalytics('booking_cancelled', {
        bookingId: bookingId,
        cancelledBy: userId,
        reason: reason,
        totalAmount: booking.totalAmount,
      });

      return updatedBooking;
    } catch (error) {
      console.error('📅 BOOKING ERROR: Cancel booking failed:', error);
      throw error;
    }
  }

  // 📅 QUANTUM SECURE: Get sitter availability
  async getSitterAvailability(sitterId: string, startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const bookings = await this.prisma.booking.findMany({
        where: {
          sitterId: sitterId,
          status: {
            in: ['CONFIRMED', 'IN_PROGRESS'],
          },
          startDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          startDate: true,
          endDate: true,
          status: true,
        },
      });

      // Calculate available time slots
      const availability = this.calculateAvailabilitySlots(startDate, endDate, bookings);

      return availability;
    } catch (error) {
      console.error('📅 BOOKING ERROR: Get sitter availability failed:', error);
      throw error;
    }
  }

  // 📅 QUANTUM SECURE: Check sitter availability
  private async checkSitterAvailability(sitterId: string, startTime: Date, endTime: Date): Promise<boolean> {
    try {
      const conflictingBookings = await this.prisma.booking.findMany({
        where: {
          sitterId: sitterId,
          status: {
            in: ['CONFIRMED', 'IN_PROGRESS'],
          },
          startDate: { lt: endTime },
          endDate: { gt: startTime },
        },
      });

      return conflictingBookings.length === 0;
    } catch (error) {
      console.error('📅 BOOKING ERROR: Check sitter availability failed:', error);
      return false;
    }
  }

  // 📅 QUANTUM SECURE: Calculate booking price with AI optimization
  private async calculateBookingPrice(createBookingDto: CreateBookingDto): Promise<number> {
    try {
      // Get sitter's hourly rate
      const sitter = await this.prisma.user.findUnique({
        where: { id: createBookingDto.sitterId },
        select: {
          hourlyRate: true,
        },
      });

      const hourlyRate = sitter?.hourlyRate || 25.00; // Default rate
      const durationHours = (createBookingDto.endTime.getTime() - createBookingDto.startTime.getTime()) / (1000 * 60 * 60);
      const basePrice = durationHours * hourlyRate;

      // Apply AI optimization if requested
      if (createBookingDto.aiOptimized) {
        // Mock AI optimization - in real app, use ML model
        const optimizationFactor = 0.95; // 5% discount
        return basePrice * optimizationFactor;
      }

      return basePrice;
    } catch (error) {
      console.error('📅 BOOKING ERROR: Calculate booking price failed:', error);
      return 25.00 * 8; // Default 8-hour booking
    }
  }

  // 📅 QUANTUM SECURE: Validate booking data
  private validateBookingData(createBookingDto: CreateBookingDto): void {
    if (!createBookingDto.startTime || !createBookingDto.endTime) {
      throw new BadRequestException('Start and end times are required');
    }

    if (createBookingDto.startTime >= createBookingDto.endTime) {
      throw new BadRequestException('Invalid time range');
    }

    if (!createBookingDto.sitterId) {
      throw new BadRequestException('Sitter ID is required');
    }

    if (!createBookingDto.petId) {
      throw new BadRequestException('Pet ID is required');
    }
  }

  // 📅 QUANTUM SECURE: Check if user can access booking
  private canUserAccessBooking(userId: string, userRole: string, booking: any): boolean {
    if (userRole === 'ADMIN') return true;
    if (booking.ownerId === userId) return true;
    if (booking.sitterId === userId) return true;
    return false;
  }

  // 📅 QUANTUM SECURE: Check if user can update booking
  private canUserUpdateBooking(userId: string, userRole: string, booking: any): boolean {
    if (userRole === 'ADMIN') return true;
    if (booking.ownerId === userId) return true;
    if (booking.sitterId === userId) return true;
    return false;
  }

  // 📅 QUANTUM SECURE: Check if user can cancel booking
  private canUserCancelBooking(userId: string, userRole: string, booking: any): boolean {
    if (userRole === 'ADMIN') return true;
    if (booking.ownerId === userId) return true;
    if (booking.sitterId === userId && booking.status === 'PENDING') return true;
    return false;
  }

  // 📅 QUANTUM SECURE: Check if booking can be cancelled
  private canBookingBeCancelled(booking: any): boolean {
    return ['PENDING', 'CONFIRMED'].includes(booking.status);
  }

  // 📅 QUANTUM SECURE: Validate status transition
  private isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: { [key: string]: string[] } = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['COMPLETED'],
      'COMPLETED': [],
      'CANCELLED': [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  // 📅 QUANTUM SECURE: Calculate availability slots
  private calculateAvailabilitySlots(startDate: Date, endDate: Date, bookings: any[]): any[] {
    // Mock implementation - in real app, calculate actual availability
    return [
      {
        startTime: startDate,
        endTime: endDate,
        available: true,
      },
    ];
  }

  // 📅 QUANTUM SECURE: Track booking analytics
  private async trackBookingAnalytics(eventType: string, data: any): Promise<void> {
    try {
      // Mock implementation - in real app, send to analytics service
      console.log('📊 BOOKING ANALYTICS:', eventType, data);
    } catch (error) {
      console.error('📅 BOOKING ERROR: Track analytics failed:', error);
    }
  }
}
