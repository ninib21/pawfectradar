import { Module } from '@nestjs/common';
import { QuantumMonitoringService } from './quantum-monitoring.service';
import { QuantumMonitoringController } from './quantum-monitoring.controller';

@Module({
  providers: [QuantumMonitoringService],
  controllers: [QuantumMonitoringController],
  exports: [QuantumMonitoringService],
})
export class QuantumMonitoringModule {}
