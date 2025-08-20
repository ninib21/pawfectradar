import { Controller, Get, Post } from '@nestjs/common';
import { QuantumComplianceService } from './quantum-compliance.service';

@Controller('quantum/compliance')
export class QuantumComplianceController {
  constructor(private readonly quantumComplianceService: QuantumComplianceService) {}

  @Get('status')
  async getComplianceStatus() {
    return this.quantumComplianceService.getComplianceStatus();
  }

  @Post('audit')
  async performComplianceAudit() {
    return this.quantumComplianceService.performComplianceAudit();
  }
}
