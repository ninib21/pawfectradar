import { Controller, Get } from '@nestjs/common';
import { QuantumMonitoringService } from './quantum-monitoring.service';

@Controller('quantum/monitoring')
export class QuantumMonitoringController {
  constructor(private readonly quantumMonitoringService: QuantumMonitoringService) {}

  @Get('status')
  async getMonitoringStatus() {
    return this.quantumMonitoringService.getMonitoringStatus();
  }

  @Get('system')
  async getSystemMetrics() {
    return this.quantumMonitoringService.getSystemMetrics();
  }

  @Get('quantum')
  async getQuantumMetrics() {
    return this.quantumMonitoringService.getQuantumMetrics();
  }

  @Get('performance')
  async getPerformanceMetrics() {
    return this.quantumMonitoringService.getPerformanceMetrics();
  }

  @Get('security')
  async getSecurityMetrics() {
    return this.quantumMonitoringService.getSecurityMetrics();
  }
}
