import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [HealthService, PrismaService],
  exports: [HealthService],
})
export class HealthModule {}
