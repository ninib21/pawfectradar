import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [SearchService, PrismaService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {}
