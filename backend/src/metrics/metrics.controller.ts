import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('status')
  async getMetricsStatus() {
    return this.metricsService.getMetricsStatus();
  }

  @Get('system')
  async getSystemMetrics() {
    return this.metricsService.getSystemMetrics();
  }

  @Get('business')
  async getBusinessMetrics() {
    return this.metricsService.getBusinessMetrics();
  }

  @Get('performance')
  async getPerformanceMetrics() {
    return this.metricsService.getPerformanceMetrics();
  }
}
