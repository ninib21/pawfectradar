import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('bookings')
  async getBookingAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getBookingAnalytics(start, end);
  }

  @Get('users')
  async getUserAnalytics() {
    return this.analyticsService.getUserAnalytics();
  }

  @Get('revenue')
  async getRevenueAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getRevenueAnalytics(start, end);
  }

  @Get('top-sitters')
  async getTopSitters(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.analyticsService.getTopSitters(limitNum);
  }

  @Get('pets')
  async getPetAnalytics() {
    return this.analyticsService.getPetAnalytics();
  }
}
