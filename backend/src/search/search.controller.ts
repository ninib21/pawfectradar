import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { SearchService, SearchSittersDto } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('status')
  async getSearchStatus() {
    return this.searchService.getSearchStatus();
  }

  @Post('sitters')
  async searchSitters(@Body() searchDto: SearchSittersDto) {
    return this.searchService.searchSitters(searchDto);
  }

  @Get('pets')
  async searchPets(@Query('query') query: string) {
    return this.searchService.searchPets(query);
  }

  @Get('bookings')
  async searchBookings(@Query('query') query: string) {
    return this.searchService.searchBookings(query);
  }

  @Get('suggestions')
  async getSearchSuggestions(@Query('query') query: string) {
    return this.searchService.getSearchSuggestions(query);
  }
}
