import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ReviewsService, CreateReviewDto, UpdateReviewDto } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  async findAll() {
    return this.reviewsService.findAll();
  }

  @Get('sitter/:sitterId')
  async findBySitterId(@Param('sitterId') sitterId: string) {
    return this.reviewsService.findBySitterId(sitterId);
  }

  @Get('sitter/:sitterId/average-rating')
  async getAverageRating(@Param('sitterId') sitterId: string) {
    return this.reviewsService.getAverageRating(sitterId);
  }

  @Get('booking/:bookingId')
  async findByBookingId(@Param('bookingId') bookingId: string) {
    return this.reviewsService.findByBookingId(bookingId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.reviewsService.findById(id);
  }

  @Post()
  async create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.reviewsService.delete(id);
  }
}
