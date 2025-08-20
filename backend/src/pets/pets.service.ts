import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreatePetDto {
  name: string;
  type: 'DOG' | 'CAT' | 'BIRD' | 'FISH' | 'OTHER';
  breed?: string;
  age?: number;
  weight?: number;
  ownerId: string;
  specialNeeds?: string;
  photos?: string[];
}

export interface UpdatePetDto {
  name?: string;
  type?: 'DOG' | 'CAT' | 'BIRD' | 'FISH' | 'OTHER';
  breed?: string;
  age?: number;
  weight?: number;
  specialNeeds?: string;
  photos?: string[];
}

@Injectable()
export class PetsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      const pets = await this.prisma.pet.findMany({
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
      return pets;
    } catch (error) {
      console.error('🔒 QUANTUM PETS: Error fetching pets:', error);
      throw new Error('Failed to fetch pets');
    }
  }

  async findById(id: string) {
    try {
      const pet = await this.prisma.pet.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!pet) {
        throw new NotFoundException('Pet not found');
      }

      return pet;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('🔒 QUANTUM PETS: Error fetching pet:', error);
      throw new Error('Failed to fetch pet');
    }
  }

  async findByOwnerId(ownerId: string) {
    try {
      const pets = await this.prisma.pet.findMany({
        where: { ownerId },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
      return pets;
    } catch (error) {
      console.error('🔒 QUANTUM PETS: Error fetching pets by owner:', error);
      throw new Error('Failed to fetch pets by owner');
    }
  }

  async create(createPetDto: CreatePetDto) {
    try {
      // Verify owner exists
      const owner = await this.prisma.user.findUnique({
        where: { id: createPetDto.ownerId },
      });

      if (!owner) {
        throw new BadRequestException('Owner not found');
      }

      if (owner.role !== 'OWNER') {
        throw new BadRequestException('User must be an owner to create pets');
      }

      const pet = await this.prisma.pet.create({
        data: {
          name: createPetDto.name,
          type: createPetDto.type,
          breed: createPetDto.breed,
          age: createPetDto.age,
          weight: createPetDto.weight,
          ownerId: createPetDto.ownerId,
          specialNeeds: createPetDto.specialNeeds,
          photos: createPetDto.photos || [],
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      console.log('🔒 QUANTUM PETS: Pet created successfully:', pet.id);
      return pet;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('🔒 QUANTUM PETS: Error creating pet:', error);
      throw new Error('Failed to create pet');
    }
  }

  async update(id: string, updatePetDto: UpdatePetDto) {
    try {
      const pet = await this.prisma.pet.update({
        where: { id },
        data: updatePetDto,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      console.log('🔒 QUANTUM PETS: Pet updated successfully:', pet.id);
      return pet;
    } catch (error) {
      console.error('🔒 QUANTUM PETS: Error updating pet:', error);
      throw new Error('Failed to update pet');
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.pet.delete({
        where: { id },
      });

      console.log('🔒 QUANTUM PETS: Pet deleted successfully:', id);
      return { message: 'Pet deleted successfully' };
    } catch (error) {
      console.error('🔒 QUANTUM PETS: Error deleting pet:', error);
      throw new Error('Failed to delete pet');
    }
  }

  async findByType(type: 'DOG' | 'CAT' | 'BIRD' | 'FISH' | 'OTHER') {
    try {
      const pets = await this.prisma.pet.findMany({
        where: { type },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
      return pets;
    } catch (error) {
      console.error('🔒 QUANTUM PETS: Error fetching pets by type:', error);
      throw new Error('Failed to fetch pets by type');
    }
  }

  async findDogs() {
    return this.findByType('DOG');
  }

  async findCats() {
    return this.findByType('CAT');
  }

  async findOtherPets() {
    try {
      const pets = await this.prisma.pet.findMany({
        where: {
          type: {
            in: ['BIRD', 'FISH', 'OTHER'],
          },
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
      return pets;
    } catch (error) {
      console.error('🔒 QUANTUM PETS: Error fetching other pets:', error);
      throw new Error('Failed to fetch other pets');
    }
  }
}
