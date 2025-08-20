import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    try {
      const totalUsers = await this.prisma.user.count();
      const totalBookings = await this.prisma.booking.count();
      const totalPets = await this.prisma.pet.count();
      const totalPayments = await this.prisma.payment.count();
      const totalReviews = await this.prisma.review.count();

      const completedBookings = await this.prisma.booking.count({
        where: { status: 'COMPLETED' },
      });

      const pendingBookings = await this.prisma.booking.count({
        where: { status: 'PENDING' },
      });

      const totalRevenue = await this.prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      });

      return {
        totalUsers,
        totalBookings,
        totalPets,
        totalPayments,
        totalReviews,
        completedBookings,
        pendingBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      };
    } catch (error) {
      console.error('🔒 QUANTUM ANALYTICS: Error getting dashboard stats:', error);
      throw new Error('Failed to get dashboard stats');
    }
  }

  async getBookingAnalytics(startDate?: Date, endDate?: Date) {
    try {
      const whereClause: any = {};
      
      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: startDate,
          lte: endDate,
        };
      }

      const bookings = await this.prisma.booking.findMany({
        where: whereClause,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          sitter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const statusCounts = {
        PENDING: 0,
        CONFIRMED: 0,
        IN_PROGRESS: 0,
        COMPLETED: 0,
        CANCELLED: 0,
      };

      bookings.forEach((booking) => {
        statusCounts[booking.status]++;
      });

      return {
        totalBookings: bookings.length,
        statusCounts,
        bookings,
      };
    } catch (error) {
      console.error('🔒 QUANTUM ANALYTICS: Error getting booking analytics:', error);
      throw new Error('Failed to get booking analytics');
    }
  }

  async getUserAnalytics() {
    try {
      const totalUsers = await this.prisma.user.count();
      const owners = await this.prisma.user.count({
        where: { role: 'OWNER' },
      });
      const sitters = await this.prisma.user.count({
        where: { role: 'SITTER' },
      });

      const recentUsers = await this.prisma.user.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      return {
        totalUsers,
        owners,
        sitters,
        recentUsers,
        ownerPercentage: totalUsers > 0 ? (owners / totalUsers) * 100 : 0,
        sitterPercentage: totalUsers > 0 ? (sitters / totalUsers) * 100 : 0,
      };
    } catch (error) {
      console.error('🔒 QUANTUM ANALYTICS: Error getting user analytics:', error);
      throw new Error('Failed to get user analytics');
    }
  }

  async getRevenueAnalytics(startDate?: Date, endDate?: Date) {
    try {
      const whereClause: any = { status: 'COMPLETED' };
      
      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: startDate,
          lte: endDate,
        };
      }

      const payments = await this.prisma.payment.findMany({
        where: whereClause,
        include: {
          booking: {
            include: {
              owner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
              sitter: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const averagePayment = payments.length > 0 ? totalRevenue / payments.length : 0;

      return {
        totalRevenue,
        averagePayment,
        totalPayments: payments.length,
        payments,
      };
    } catch (error) {
      console.error('🔒 QUANTUM ANALYTICS: Error getting revenue analytics:', error);
      throw new Error('Failed to get revenue analytics');
    }
  }

  async getTopSitters(limit: number = 10) {
    try {
      const sitters = await this.prisma.user.findMany({
        where: { role: 'SITTER' },
        include: {
          bookingsAsSitter: {
            include: {
              reviews: true,
            },
          },
        },
      });

      const sitterStats = sitters.map((sitter) => {
        const totalBookings = sitter.bookingsAsSitter.length;
        const completedBookings = sitter.bookingsAsSitter.filter(
          (booking) => booking.status === 'COMPLETED'
        ).length;
        const totalReviews = sitter.bookingsAsSitter.reduce(
          (sum, booking) => sum + booking.reviews.length,
          0
        );
        const averageRating = sitter.bookingsAsSitter.reduce((sum, booking) => {
          const bookingRating = booking.reviews.reduce(
            (reviewSum, review) => reviewSum + review.rating,
            0
          );
          return sum + (booking.reviews.length > 0 ? bookingRating / booking.reviews.length : 0);
        }, 0) / (sitter.bookingsAsSitter.length > 0 ? sitter.bookingsAsSitter.length : 1);

        return {
          id: sitter.id,
          firstName: sitter.firstName,
          lastName: sitter.lastName,
          email: sitter.email,
          totalBookings,
          completedBookings,
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
        };
      });

      return sitterStats
        .sort((a, b) => b.completedBookings - a.completedBookings)
        .slice(0, limit);
    } catch (error) {
      console.error('🔒 QUANTUM ANALYTICS: Error getting top sitters:', error);
      throw new Error('Failed to get top sitters');
    }
  }

  async getPetAnalytics() {
    try {
      const totalPets = await this.prisma.pet.count();
      const dogs = await this.prisma.pet.count({
        where: { type: 'DOG' },
      });
      const cats = await this.prisma.pet.count({
        where: { type: 'CAT' },
      });
              const otherPets = await this.prisma.pet.count({
          where: {
            type: {
              in: ['BIRD', 'FISH', 'OTHER'],
            },
          },
        });

      return {
        totalPets,
        dogs,
        cats,
        otherPets,
        dogPercentage: totalPets > 0 ? (dogs / totalPets) * 100 : 0,
        catPercentage: totalPets > 0 ? (cats / totalPets) * 100 : 0,
        otherPercentage: totalPets > 0 ? (otherPets / totalPets) * 100 : 0,
      };
    } catch (error) {
      console.error('🔒 QUANTUM ANALYTICS: Error getting pet analytics:', error);
      throw new Error('Failed to get pet analytics');
    }
  }
}
