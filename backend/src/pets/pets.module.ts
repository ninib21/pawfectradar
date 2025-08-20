import { Module } from '@nestjs/common';
import { PetsService } from './pets.service';
import { PetsController } from './pets.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PetsService, PrismaService],
  controllers: [PetsController],
  exports: [PetsService],
})
export class PetsModule {}
