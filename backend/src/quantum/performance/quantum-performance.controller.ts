import { Controller, Get, Post } from '@nestjs/common';
import { QuantumPerformanceService } from './quantum-performance.service';

@Controller('quantum/performance')
export class QuantumPerformanceController {
  constructor(private readonly quantumPerformanceService: QuantumPerformanceService) {}

  @Get('status')
  async getPerformanceStatus() {
    return this.quantumPerformanceService.getPerformanceStatus();
  }

  @Post('optimize')
  async optimizePerformance() {
    return this.quantumPerformanceService.optimizePerformance();
  }
}
