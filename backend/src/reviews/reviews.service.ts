import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateReviewDto {
  bookingId: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
}

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      const reviews = await this.prisma.review.findMany({
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
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return reviews;
    } catch (error) {
      console.error('🔒 QUANTUM REVIEWS: Error fetching reviews:', error);
      throw new Error('Failed to fetch reviews');
    }
  }

  async findById(id: string) {
    try {
      const review = await this.prisma.review.findUnique({
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
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      return review;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('🔒 QUANTUM REVIEWS: Error fetching review:', error);
      throw new Error('Failed to fetch review');
    }
  }

  async findByBookingId(bookingId: string) {
    try {
      const reviews = await this.prisma.review.findMany({
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
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return reviews;
    } catch (error) {
      console.error('🔒 QUANTUM REVIEWS: Error fetching reviews by booking:', error);
      throw new Error('Failed to fetch reviews by booking');
    }
  }

  async findBySitterId(sitterId: string) {
    try {
      const reviews = await this.prisma.review.findMany({
        where: {
          booking: {
            sitterId: sitterId,
          },
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
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return reviews;
    } catch (error) {
      console.error('🔒 QUANTUM REVIEWS: Error fetching reviews by sitter:', error);
      throw new Error('Failed to fetch reviews by sitter');
    }
  }

  async create(createReviewDto: CreateReviewDto) {
    try {
      // Verify booking exists
      const booking = await this.prisma.booking.findUnique({
        where: { id: createReviewDto.bookingId },
      });

      if (!booking) {
        throw new BadRequestException('Booking not found');
      }

      // Verify reviewer exists
      const reviewer = await this.prisma.user.findUnique({
        where: { id: createReviewDto.reviewerId },
      });

      if (!reviewer) {
        throw new BadRequestException('Reviewer not found');
      }

      // Check if review already exists for this booking
      const existingReview = await this.prisma.review.findFirst({
        where: { 
          bookingId: createReviewDto.bookingId,
          reviewerId: createReviewDto.reviewerId,
        },
      });

      if (existingReview) {
        throw new BadRequestException('Review already exists for this booking');
      }

      // Validate rating
      if (createReviewDto.rating < 1 || createReviewDto.rating > 5) {
        throw new BadRequestException('Rating must be between 1 and 5');
      }

      const review = await this.prisma.review.create({
        data: {
          bookingId: createReviewDto.bookingId,
          reviewerId: createReviewDto.reviewerId,
          reviewedUserId: createReviewDto.reviewedUserId,
          rating: createReviewDto.rating,
          comment: createReviewDto.comment,
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
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      console.log('🔒 QUANTUM REVIEWS: Review created successfully:', review.id);
      return review;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('🔒 QUANTUM REVIEWS: Error creating review:', error);
      throw new Error('Failed to create review');
    }
  }

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    try {
      // Validate rating if provided
      if (updateReviewDto.rating && (updateReviewDto.rating < 1 || updateReviewDto.rating > 5)) {
        throw new BadRequestException('Rating must be between 1 and 5');
      }

      const review = await this.prisma.review.update({
        where: { id },
        data: updateReviewDto,
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
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      console.log('🔒 QUANTUM REVIEWS: Review updated successfully:', review.id);
      return review;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('🔒 QUANTUM REVIEWS: Error updating review:', error);
      throw new Error('Failed to update review');
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.review.delete({
        where: { id },
      });

      console.log('🔒 QUANTUM REVIEWS: Review deleted successfully:', id);
      return { message: 'Review deleted successfully' };
    } catch (error) {
      console.error('🔒 QUANTUM REVIEWS: Error deleting review:', error);
      throw new Error('Failed to delete review');
    }
  }

  async getAverageRating(sitterId: string) {
    try {
      const reviews = await this.prisma.review.findMany({
        where: {
          booking: {
            sitterId: sitterId,
          },
        },
        select: {
          rating: true,
        },
      });

      if (reviews.length === 0) {
        return { averageRating: 0, totalReviews: 0 };
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
      };
    } catch (error) {
      console.error('🔒 QUANTUM REVIEWS: Error getting average rating:', error);
      throw new Error('Failed to get average rating');
    }
  }
}
