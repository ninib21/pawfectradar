import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Module({
  providers: [BookingsService, PrismaService, NotificationService],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
