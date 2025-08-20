import { Module } from '@nestjs/common';
import { QuantumComplianceService } from './quantum-compliance.service';
import { QuantumComplianceController } from './quantum-compliance.controller';

@Module({
  providers: [QuantumComplianceService],
  controllers: [QuantumComplianceController],
  exports: [QuantumComplianceService],
})
export class QuantumComplianceModule {}
