import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PaymentsService, CreatePaymentDto, UpdatePaymentDto } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async findAll() {
    return this.paymentsService.findAll();
  }

  @Get('stats')
  async getPaymentStats() {
    return this.paymentsService.getPaymentStats();
  }

  @Get('booking/:bookingId')
  async findByBookingId(@Param('bookingId') bookingId: string) {
    return this.paymentsService.findByBookingId(bookingId);
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED') {
    return this.paymentsService.findByStatus(status);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Put(':id/process')
  async processPayment(@Param('id') id: string) {
    return this.paymentsService.processPayment(id);
  }

  @Put(':id/refund')
  async refundPayment(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.paymentsService.refundPayment(id, body.reason);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.paymentsService.delete(id);
  }
}
