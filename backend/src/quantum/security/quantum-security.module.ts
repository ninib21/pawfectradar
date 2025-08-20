import { Module } from '@nestjs/common';
import { QuantumSecurityService } from './quantum-security.service';
import { QuantumSecurityController } from './quantum-security.controller';

@Module({
  providers: [QuantumSecurityService],
  controllers: [QuantumSecurityController],
  exports: [QuantumSecurityService],
})
export class QuantumSecurityModule {}
