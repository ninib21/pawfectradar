import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateSessionDto {
  userId: string;
  bookingId: string;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      const sessions = await this.prisma.session.findMany({
        include: {
          user: {
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
      return sessions;
    } catch (error) {
      console.error('🔒 QUANTUM SESSIONS: Error fetching sessions:', error);
      throw new Error('Failed to fetch sessions');
    }
  }

  async findById(id: string) {
    try {
      const session = await this.prisma.session.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!session) {
        throw new NotFoundException('Session not found');
      }

      return session;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('🔒 QUANTUM SESSIONS: Error fetching session:', error);
      throw new Error('Failed to fetch session');
    }
  }

  async findByUserId(userId: string) {
    try {
      const sessions = await this.prisma.session.findMany({
        where: { userId },
        include: {
          user: {
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
      return sessions;
    } catch (error) {
      console.error('🔒 QUANTUM SESSIONS: Error fetching sessions by user:', error);
      throw new Error('Failed to fetch sessions by user');
    }
  }

  async create(createSessionDto: CreateSessionDto) {
    try {
      const session = await this.prisma.session.create({
        data: {
          userId: createSessionDto.userId,
          bookingId: createSessionDto.bookingId,
          startTime: createSessionDto.startTime,
          endTime: createSessionDto.endTime,
          notes: createSessionDto.notes,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      console.log('🔒 QUANTUM SESSIONS: Session created successfully:', session.id);
      return session;
    } catch (error) {
      console.error('🔒 QUANTUM SESSIONS: Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  async deactivate(id: string) {
    try {
      const session = await this.prisma.session.update({
        where: { id },
        data: { status: 'COMPLETED' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      console.log('🔒 QUANTUM SESSIONS: Session deactivated successfully:', session.id);
      return session;
    } catch (error) {
      console.error('🔒 QUANTUM SESSIONS: Error deactivating session:', error);
      throw new Error('Failed to deactivate session');
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.session.delete({
        where: { id },
      });

      console.log('🔒 QUANTUM SESSIONS: Session deleted successfully:', id);
      return { message: 'Session deleted successfully' };
    } catch (error) {
      console.error('🔒 QUANTUM SESSIONS: Error deleting session:', error);
      throw new Error('Failed to delete session');
    }
  }

  async deleteAllByUserId(userId: string) {
    try {
      await this.prisma.session.deleteMany({
        where: { userId },
      });

      console.log('🔒 QUANTUM SESSIONS: All sessions deleted for user:', userId);
      return { message: 'All sessions deleted successfully' };
    } catch (error) {
      console.error('🔒 QUANTUM SESSIONS: Error deleting all sessions:', error);
      throw new Error('Failed to delete all sessions');
    }
  }

  async getActiveSessions(userId: string) {
    try {
      const sessions = await this.prisma.session.findMany({
        where: { 
          userId,
          status: 'ACTIVE',
        },
        include: {
          user: {
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
      return sessions;
    } catch (error) {
      console.error('🔒 QUANTUM SESSIONS: Error fetching active sessions:', error);
      throw new Error('Failed to fetch active sessions');
    }
  }
}
