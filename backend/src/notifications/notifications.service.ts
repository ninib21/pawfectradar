import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateNotificationDto {
  userId: string;
  type: 'BOOKING_CONFIRMED' | 'PAYMENT_RECEIVED' | 'SESSION_STARTED' | 'SESSION_ENDED' | 'NEW_MESSAGE' | 'REVIEW_RECEIVED' | 'EMERGENCY_ALERT';
  title: string;
  message: string;
  data?: any;
}

export interface UpdateNotificationDto {
  read?: boolean;
  title?: string;
  message?: string;
  data?: any;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      const notifications = await this.prisma.notification.findMany({
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
      return notifications;
    } catch (error) {
      console.error('🔒 QUANTUM NOTIFICATIONS: Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  async findById(id: string) {
    try {
      const notification = await this.prisma.notification.findUnique({
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

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      return notification;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('🔒 QUANTUM NOTIFICATIONS: Error fetching notification:', error);
      throw new Error('Failed to fetch notification');
    }
  }

  async findByUserId(userId: string) {
    try {
      const notifications = await this.prisma.notification.findMany({
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
      return notifications;
    } catch (error) {
      console.error('🔒 QUANTUM NOTIFICATIONS: Error fetching notifications by user:', error);
      throw new Error('Failed to fetch notifications by user');
    }
  }

    async findUnreadByUserId(userId: string) {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: {
          userId,
          isRead: false,
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
      return notifications;
    } catch (error) {
      console.error('🔒 QUANTUM NOTIFICATIONS: Error fetching unread notifications:', error);
      throw new Error('Failed to fetch unread notifications');
    }
  }

  async create(createNotificationDto: CreateNotificationDto) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: createNotificationDto.userId,
          type: createNotificationDto.type,
          title: createNotificationDto.title,
          message: createNotificationDto.message,
          data: createNotificationDto.data ?? {},
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

      console.log('🔒 QUANTUM NOTIFICATIONS: Notification created successfully:', notification.id);
      return notification;
    } catch (error) {
      console.error('🔒 QUANTUM NOTIFICATIONS: Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto) {
    try {
      const notification = await this.prisma.notification.update({
        where: { id },
        data: updateNotificationDto,
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

      console.log('🔒 QUANTUM NOTIFICATIONS: Notification updated successfully:', notification.id);
      return notification;
    } catch (error) {
      console.error('🔒 QUANTUM NOTIFICATIONS: Error updating notification:', error);
      throw new Error('Failed to update notification');
    }
  }

  async markAsRead(id: string) {
    try {
      const notification =       await this.prisma.notification.update({
        where: { id },
        data: { isRead: true },
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

      console.log('🔒 QUANTUM NOTIFICATIONS: Notification marked as read:', notification.id);
      return notification;
    } catch (error) {
      console.error('🔒 QUANTUM NOTIFICATIONS: Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  async markAllAsRead(userId: string) {
    try {
            await this.prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: { isRead: true },
      });

      console.log('🔒 QUANTUM NOTIFICATIONS: All notifications marked as read for user:', userId);
      return { message: 'All notifications marked as read' };
    } catch (error) {
      console.error('🔒 QUANTUM NOTIFICATIONS: Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.notification.delete({
        where: { id },
      });

      console.log('🔒 QUANTUM NOTIFICATIONS: Notification deleted successfully:', id);
      return { message: 'Notification deleted successfully' };
    } catch (error) {
      console.error('🔒 QUANTUM NOTIFICATIONS: Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  async deleteAllByUserId(userId: string) {
    try {
      await this.prisma.notification.deleteMany({
        where: { userId },
      });

      console.log('🔒 QUANTUM NOTIFICATIONS: All notifications deleted for user:', userId);
      return { message: 'All notifications deleted successfully' };
    } catch (error) {
      console.error('🔒 QUANTUM NOTIFICATIONS: Error deleting all notifications:', error);
      throw new Error('Failed to delete all notifications');
    }
  }

  async getUnreadCount(userId: string) {
    try {
      const count = await this.prisma.notification.count({
        where: { 
          userId,
          isRead: false,
        },
      });
      return { count };
    } catch (error) {
      console.error('🔒 QUANTUM NOTIFICATIONS: Error getting unread count:', error);
      throw new Error('Failed to get unread count');
    }
  }

  async findByType(type: 'BOOKING_CONFIRMED' | 'PAYMENT_RECEIVED' | 'SESSION_STARTED' | 'SESSION_ENDED' | 'NEW_MESSAGE' | 'REVIEW_RECEIVED' | 'EMERGENCY_ALERT') {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: { type },
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
      return notifications;
    } catch (error) {
      console.error('🔒 QUANTUM NOTIFICATIONS: Error fetching notifications by type:', error);
      throw new Error('Failed to fetch notifications by type');
    }
  }
}
