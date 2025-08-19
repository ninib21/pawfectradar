import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { QuantumPrismaService } from './quantum-prisma.service';

@Module({
  providers: [
    PrismaService,
    QuantumPrismaService
  ],
  exports: [
    PrismaService,
    QuantumPrismaService
  ]
})
export class PrismaModule {}
