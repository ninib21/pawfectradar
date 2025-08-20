import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PetsService, CreatePetDto, UpdatePetDto } from './pets.service';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  async findAll() {
    return this.petsService.findAll();
  }

  @Get('dogs')
  async findDogs() {
    return this.petsService.findDogs();
  }

  @Get('cats')
  async findCats() {
    return this.petsService.findCats();
  }

  @Get('other')
  async findOtherPets() {
    return this.petsService.findOtherPets();
  }

  @Get('owner/:ownerId')
  async findByOwnerId(@Param('ownerId') ownerId: string) {
    return this.petsService.findByOwnerId(ownerId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.petsService.findById(id);
  }

  @Post()
  async create(@Body() createPetDto: CreatePetDto) {
    return this.petsService.create(createPetDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto) {
    return this.petsService.update(id, updatePetDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.petsService.delete(id);
  }
}
