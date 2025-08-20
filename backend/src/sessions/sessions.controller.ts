import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SessionsService, CreateSessionDto } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  async findAll() {
    return this.sessionsService.findAll();
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.sessionsService.findByUserId(userId);
  }

  @Get('user/:userId/active')
  async getActiveSessions(@Param('userId') userId: string) {
    return this.sessionsService.getActiveSessions(userId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.sessionsService.findById(id);
  }

  @Post()
  async create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.create(createSessionDto);
  }

  @Put(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return this.sessionsService.deactivate(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.sessionsService.delete(id);
  }

  @Delete('user/:userId/all')
  async deleteAllByUserId(@Param('userId') userId: string) {
    return this.sessionsService.deleteAllByUserId(userId);
  }
}
