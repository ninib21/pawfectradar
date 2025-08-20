import { Module } from '@nestjs/common';
import { QuantumPerformanceService } from './quantum-performance.service';
import { QuantumPerformanceController } from './quantum-performance.controller';

@Module({
  providers: [QuantumPerformanceService],
  controllers: [QuantumPerformanceController],
  exports: [QuantumPerformanceService],
})
export class QuantumPerformanceModule {}
