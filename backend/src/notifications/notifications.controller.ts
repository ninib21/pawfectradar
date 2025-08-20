import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { NotificationsService, CreateNotificationDto, UpdateNotificationDto } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll() {
    return this.notificationsService.findAll();
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.notificationsService.findByUserId(userId);
  }

  @Get('user/:userId/unread')
  async findUnreadByUserId(@Param('userId') userId: string) {
    return this.notificationsService.findUnreadByUserId(userId);
  }

  @Get('user/:userId/unread-count')
  async getUnreadCount(@Param('userId') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get('type/:type')
  async findByType(@Param('type') type: 'BOOKING_CONFIRMED' | 'PAYMENT_RECEIVED' | 'SESSION_STARTED' | 'SESSION_ENDED' | 'NEW_MESSAGE' | 'REVIEW_RECEIVED' | 'EMERGENCY_ALERT') {
    return this.notificationsService.findByType(type);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.notificationsService.findById(id);
  }

  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Put('user/:userId/read-all')
  async markAllAsRead(@Param('userId') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }

  @Delete('user/:userId/all')
  async deleteAllByUserId(@Param('userId') userId: string) {
    return this.notificationsService.deleteAllByUserId(userId);
  }
}
