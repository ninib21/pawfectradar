import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async checkDatabaseHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', database: 'connected' };
    } catch (error) {
      return { status: 'unhealthy', database: 'disconnected', error: error.message };
    }
  }

  async getSystemStatus() {
    const dbHealth = await this.checkDatabaseHealth();
    
    return {
      status: dbHealth.status,
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth.database,
        api: 'healthy',
        quantum: 'operational'
      },
      version: process.env.APP_VERSION || '1.0.0'
    };
  }
}
