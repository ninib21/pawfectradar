import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role: 'OWNER' | 'SITTER';
  phone?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePicture?: string;
  bio?: string;
  hourlyRate?: number;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          profilePicture: true,
          bio: true,
          hourlyRate: true,
          rating: true,
          reviewCount: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return users;
    } catch (error) {
      console.error('🔒 QUANTUM USERS: Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async findById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          profilePicture: true,
          bio: true,
          hourlyRate: true,
          rating: true,
          reviewCount: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('🔒 QUANTUM USERS: Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      return user;
    } catch (error) {
      console.error('🔒 QUANTUM USERS: Error fetching user by email:', error);
      throw new Error('Failed to fetch user by email');
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email.toLowerCase() },
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email.toLowerCase(),
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          role: createUserDto.role,
          phone: createUserDto.phone,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log('🔒 QUANTUM USERS: User created successfully:', user.id);
      return user;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('🔒 QUANTUM USERS: Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          profilePicture: true,
          bio: true,
          hourlyRate: true,
          rating: true,
          reviewCount: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log('🔒 QUANTUM USERS: User updated successfully:', user.id);
      return user;
    } catch (error) {
      console.error('🔒 QUANTUM USERS: Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id },
      });

      console.log('🔒 QUANTUM USERS: User deleted successfully:', id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      console.error('🔒 QUANTUM USERS: Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  async findSitters() {
    try {
      const sitters = await this.prisma.user.findMany({
        where: { role: 'SITTER' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          profilePicture: true,
          bio: true,
          hourlyRate: true,
          rating: true,
          reviewCount: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return sitters;
    } catch (error) {
      console.error('🔒 QUANTUM USERS: Error fetching sitters:', error);
      throw new Error('Failed to fetch sitters');
    }
  }

  async findOwners() {
    try {
      const owners = await this.prisma.user.findMany({
        where: { role: 'OWNER' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          profilePicture: true,
          bio: true,
          hourlyRate: true,
          rating: true,
          reviewCount: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return owners;
    } catch (error) {
      console.error('🔒 QUANTUM USERS: Error fetching owners:', error);
      throw new Error('Failed to fetch owners');
    }
  }
}
