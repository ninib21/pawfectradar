import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { BookingsService, CreateBookingDto, UpdateBookingDto } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  async findAll() {
    return this.bookingsService.findAll();
  }

  @Get('owner/:ownerId')
  async findByOwnerId(@Param('ownerId') ownerId: string) {
    return this.bookingsService.findByOwnerId(ownerId);
  }

  @Get('sitter/:sitterId')
  async findBySitterId(@Param('sitterId') sitterId: string) {
    return this.bookingsService.findBySitterId(sitterId);
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') {
    return this.bookingsService.findByStatus(status);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  @Post()
  async create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Put(':id/status/:status')
  async updateStatus(
    @Param('id') id: string,
    @Param('status') status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  ) {
    return this.bookingsService.updateStatus(id, status);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.bookingsService.delete(id);
  }
}
