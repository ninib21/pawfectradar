import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreatePaymentDto {
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'APPLE_PAY' | 'GOOGLE_PAY';
  description?: string;
}

export interface UpdatePaymentDto {
  status?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
}

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      const payments = await this.prisma.payment.findMany({
        include: {
          booking: {
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
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return payments;
    } catch (error) {
      console.error('🔒 QUANTUM PAYMENTS: Error fetching payments:', error);
      throw new Error('Failed to fetch payments');
    }
  }

  async findById(id: string) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id },
        include: {
          booking: {
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
            },
          },
        },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      return payment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('🔒 QUANTUM PAYMENTS: Error fetching payment:', error);
      throw new Error('Failed to fetch payment');
    }
  }

  async findByBookingId(bookingId: string) {
    try {
      const payments = await this.prisma.payment.findMany({
        where: { bookingId },
        include: {
          booking: {
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
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return payments;
    } catch (error) {
      console.error('🔒 QUANTUM PAYMENTS: Error fetching payments by booking:', error);
      throw new Error('Failed to fetch payments by booking');
    }
  }

  async create(createPaymentDto: CreatePaymentDto) {
    try {
      // Verify booking exists
      const booking = await this.prisma.booking.findUnique({
        where: { id: createPaymentDto.bookingId },
      });

      if (!booking) {
        throw new BadRequestException('Booking not found');
      }

      // Check if payment already exists for this booking
      const existingPayment = await this.prisma.payment.findFirst({
        where: { bookingId: createPaymentDto.bookingId },
      });

      if (existingPayment) {
        throw new BadRequestException('Payment already exists for this booking');
      }

      // Mock payment processing (in real implementation, this would integrate with Stripe/PayPal)
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const status = 'PAID'; // Mock successful payment

      const payment = await this.prisma.payment.create({
        data: {
          bookingId: createPaymentDto.bookingId,
          amount: createPaymentDto.amount,
          currency: createPaymentDto.currency,
          paymentMethod: createPaymentDto.paymentMethod,

          status: status,

        },
        include: {
          booking: {
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
            },
          },
        },
      });

      console.log('🔒 QUANTUM PAYMENTS: Payment created successfully:', payment.id);
      return payment;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('🔒 QUANTUM PAYMENTS: Error creating payment:', error);
      throw new Error('Failed to create payment');
    }
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    try {
      const payment = await this.prisma.payment.update({
        where: { id },
        data: updatePaymentDto,
        include: {
          booking: {
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
            },
          },
        },
      });

      console.log('🔒 QUANTUM PAYMENTS: Payment updated successfully:', payment.id);
      return payment;
    } catch (error) {
      console.error('🔒 QUANTUM PAYMENTS: Error updating payment:', error);
      throw new Error('Failed to update payment');
    }
  }

  async processPayment(id: string) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status !== 'PENDING') {
        throw new BadRequestException('Payment is not in pending status');
      }

      // Mock payment processing
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const status = 'PAID'; // Mock successful payment

      const updatedPayment = await this.prisma.payment.update({
        where: { id },
        data: {
          status: status,
        },
        include: {
          booking: {
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
            },
          },
        },
      });

      console.log('🔒 QUANTUM PAYMENTS: Payment processed successfully:', updatedPayment.id);
      return updatedPayment;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('🔒 QUANTUM PAYMENTS: Error processing payment:', error);
      throw new Error('Failed to process payment');
    }
  }

  async refundPayment(id: string, reason?: string) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status !== 'PAID') {
        throw new BadRequestException('Payment is not completed and cannot be refunded');
      }

      const updatedPayment = await this.prisma.payment.update({
        where: { id },
        data: {
          status: 'REFUNDED',
        },
        include: {
          booking: {
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
            },
          },
        },
      });

      console.log('🔒 QUANTUM PAYMENTS: Payment refunded successfully:', updatedPayment.id);
      return updatedPayment;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('🔒 QUANTUM PAYMENTS: Error refunding payment:', error);
      throw new Error('Failed to refund payment');
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.payment.delete({
        where: { id },
      });

      console.log('🔒 QUANTUM PAYMENTS: Payment deleted successfully:', id);
      return { message: 'Payment deleted successfully' };
    } catch (error) {
      console.error('🔒 QUANTUM PAYMENTS: Error deleting payment:', error);
      throw new Error('Failed to delete payment');
    }
  }

  async findByStatus(status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED') {
    try {
      const payments = await this.prisma.payment.findMany({
        where: { status },
        include: {
          booking: {
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
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return payments;
    } catch (error) {
      console.error('🔒 QUANTUM PAYMENTS: Error fetching payments by status:', error);
      throw new Error('Failed to fetch payments by status');
    }
  }

  async getPaymentStats() {
    try {
      const totalPayments = await this.prisma.payment.count();
              const completedPayments = await this.prisma.payment.count({
          where: { status: 'PAID' },
        });
      const pendingPayments = await this.prisma.payment.count({
        where: { status: 'PENDING' },
      });
      const totalAmount = await this.prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      });

      return {
        totalPayments,
        completedPayments,
        pendingPayments,
        totalAmount: totalAmount._sum.amount || 0,
      };
    } catch (error) {
      console.error('🔒 QUANTUM PAYMENTS: Error getting payment stats:', error);
      throw new Error('Failed to get payment stats');
    }
  }
}
