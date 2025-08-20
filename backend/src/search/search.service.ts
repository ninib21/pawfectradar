import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SearchSittersDto {
  query?: string;
  location?: string;
  petType?: string;
  rating?: number;
  priceRange?: { min: number; max: number };
  availability?: { startDate: Date; endDate: Date };
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchSitters(searchDto: SearchSittersDto) {
    try {
      const whereClause: any = {
        role: 'SITTER',
      };

      if (searchDto.location) {
        whereClause.OR = [
          { firstName: { contains: searchDto.location, mode: 'insensitive' } },
          { lastName: { contains: searchDto.location, mode: 'insensitive' } },
        ];
      }

      const sitters = await this.prisma.user.findMany({
        where: whereClause,
        include: {
          bookingsAsSitter: {
            include: {
              reviews: true,
            },
          },
        },
        take: 20,
      });

      // Filter by rating if specified
      let filteredSitters = sitters;
      if (searchDto.rating) {
        filteredSitters = sitters.filter((sitter) => {
          const reviews = sitter.bookingsAsSitter.flatMap((booking) => booking.reviews);
          if (reviews.length === 0) return false;
          const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
          return averageRating >= searchDto.rating!;
        });
      }

      console.log('🔍 QUANTUM SEARCH: Sitters search completed');
      return filteredSitters;
    } catch (error) {
      console.error('🔍 QUANTUM SEARCH: Error searching sitters:', error);
      throw new Error('Failed to search sitters');
    }
  }

  async searchPets(query: string) {
    try {
              const pets = await this.prisma.pet.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { breed: { contains: query, mode: 'insensitive' } },
            ],
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
        },
        take: 20,
      });

      console.log('🔍 QUANTUM SEARCH: Pets search completed');
      return pets;
    } catch (error) {
      console.error('🔍 QUANTUM SEARCH: Error searching pets:', error);
      throw new Error('Failed to search pets');
    }
  }

  async searchBookings(query: string) {
    try {
              const bookings = await this.prisma.booking.findMany({
          where: {
            OR: [
              { specialInstructions: { contains: query, mode: 'insensitive' } },
            ],
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
        take: 20,
      });

      console.log('🔍 QUANTUM SEARCH: Bookings search completed');
      return bookings;
    } catch (error) {
      console.error('🔍 QUANTUM SEARCH: Error searching bookings:', error);
      throw new Error('Failed to search bookings');
    }
  }

  async getSearchSuggestions(query: string) {
    try {
      const suggestions = {
        sitters: await this.prisma.user.findMany({
          where: {
            role: 'SITTER',
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
          take: 5,
        }),
        pets: await this.prisma.pet.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { breed: { contains: query, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            name: true,
            breed: true,
            type: true,
          },
          take: 5,
        }),
      };

      console.log('🔍 QUANTUM SEARCH: Search suggestions generated');
      return suggestions;
    } catch (error) {
      console.error('🔍 QUANTUM SEARCH: Error getting search suggestions:', error);
      throw new Error('Failed to get search suggestions');
    }
  }

  async getSearchStatus() {
    try {
      return {
        searchEnabled: true,
        indexingEnabled: true,
        fuzzySearchEnabled: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('🔍 QUANTUM SEARCH: Error getting search status:', error);
      throw new Error('Failed to get search status');
    }
  }
}
