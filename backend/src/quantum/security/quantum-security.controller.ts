import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { QuantumSecurityService } from './quantum-security.service';

@Controller('quantum/security')
export class QuantumSecurityController {
  constructor(private readonly quantumSecurityService: QuantumSecurityService) {}

  @Get('status')
  async getSecurityStatus() {
    return this.quantumSecurityService.getSecurityStatus();
  }

  @Post('generate-key')
  async generateQuantumKey() {
    const key = await this.quantumSecurityService.generateQuantumKey();
    return { key };
  }

  @Post('encrypt')
  async encryptData(@Body() body: { data: string; key: string }) {
    const encrypted = await this.quantumSecurityService.encryptWithQuantumAlgorithm(body.data, body.key);
    return { encrypted };
  }

  @Post('decrypt')
  async decryptData(@Body() body: { encryptedData: string; key: string }) {
    const decrypted = await this.quantumSecurityService.decryptWithQuantumAlgorithm(body.encryptedData, body.key);
    return { decrypted };
  }

  @Post('key-distribution')
  async performQuantumKeyDistribution() {
    return this.quantumSecurityService.performQuantumKeyDistribution();
  }

  @Get('threats')
  async detectQuantumThreats() {
    return this.quantumSecurityService.detectQuantumThreats();
  }

  @Get('random-number')
  async generateQuantumRandomNumber() {
    const randomNumber = await this.quantumSecurityService.generateQuantumRandomNumber();
    return { randomNumber };
  }

  @Post('authenticate/:userId')
  async performQuantumAuthentication(@Param('userId') userId: string) {
    return this.quantumSecurityService.performQuantumAuthentication(userId);
  }
}
