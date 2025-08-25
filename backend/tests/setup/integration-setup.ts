// Auto-inserted by fix script to satisfy Nest's decorators in tests
import 'reflect-metadata';
/**
 * 🧪 Integration Test Setup
 * 
 * This file sets up the environment for integration tests.
 * It configures global mocks, test utilities, and database connections.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../backend/src/prisma/prisma.service';
import { AppModule } from '../../backend/src/app.module';

// Global test variables
declare global {
  var __TEST_APP__: INestApplication;
  var __TEST_PRISMA__: PrismaService;
}

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/pawfectradar_test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-integration-tests';
process.env.QUANTUM_ENCRYPTION_KEY = 'test-quantum-key-32-chars-long';
process.env.STRIPE_SECRET_KEY = 'sk_test_test_key';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_webhook_secret';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-api-key';
process.env.CLOUDINARY_API_SECRET = 'test-api-secret';

// Global mocks for external services
(global as any).fetch = (() => {}) as any;

// Mock WebSocket with proper static properties
const MockWebSocket = function () {
  return {
    send: (() => {}) as any,
    close: (() => {}) as any,
    addEventListener: (() => {}) as any,
    removeEventListener: (() => {}) as any,
    readyState: 1,
  };
};

(MockWebSocket as any).CONNECTING = 0;
(MockWebSocket as any).OPEN = 1;
(MockWebSocket as any).CLOSING = 2;
(MockWebSocket as any).CLOSED = 3;

// Properly type the global WebSocket to match the expected interface
(global as any).WebSocket = MockWebSocket;

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

(global as any).beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  console.log = (() => {}) as any;
  console.error = (() => {}) as any;
  console.warn = (() => {}) as any;
  
  console.log('🧪 Integration test setup started...');
});

(global as any).afterAll(async () => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  
  console.log('🧪 Integration test setup completed successfully!');
});

// Test utilities
export const createTestingApp = async (): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  
  return app;
};

export const getPrismaService = (app: INestApplication): PrismaService => {
  return app.get<PrismaService>(PrismaService);
};

export const cleanupDatabase = async (prisma: PrismaService) => {
  // Clean up test data in reverse order of dependencies
  await prisma.booking.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.user.deleteMany();
};

export const createTestUser = async (prisma: PrismaService, userData: any) => {
  return await prisma.user.create({
    data: {
      email: userData.email || 'test@example.com',
      name: userData.name || 'Test User',
    },
  });
};

export const createTestPet = async (prisma: PrismaService, petData: any) => {
  return await prisma.pet.create({
    data: {
      name: petData.name || 'Test Pet',
      type: petData.type || 'DOG',
      breed: petData.breed || 'Golden Retriever',
      ownerId: petData.ownerId,
    },
  });
};

export const createTestBooking = async (prisma: PrismaService, bookingData: any) => {
  return await prisma.booking.create({
    data: {
      petId: bookingData.petId,
      sitterId: bookingData.sitterId,
      startDate: bookingData.startDate || new Date(),
      endDate: bookingData.endDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: bookingData.status || 'pending',
    },
  });
};

// Mock external services
export const mockStripeService = {
  createPaymentIntent: (() => Promise.resolve({
    id: 'pi_test_123',
    client_secret: 'pi_test_secret_123',
    amount: 1000,
    currency: 'usd',
  })) as any,
  confirmPayment: (() => Promise.resolve({
    id: 'pi_test_123',
    status: 'succeeded',
  })) as any,
  refundPayment: (() => Promise.resolve({
    id: 're_test_123',
    status: 'succeeded',
  })) as any,
};

export const mockEmailService = {
  sendEmail: (() => Promise.resolve(true)) as any,
  sendWelcomeEmail: (() => Promise.resolve(true)) as any,
  sendBookingConfirmationEmail: (() => Promise.resolve(true)) as any,
  sendPasswordResetEmail: (() => Promise.resolve(true)) as any,
};

export const mockFileUploadService = {
  uploadFile: (() => Promise.resolve({
    url: 'https://example.com/test-image.jpg',
    publicId: 'test-public-id',
  })) as any,
  deleteFile: (() => Promise.resolve(true)) as any,
};

// Test data factories
export const testData = {
  users: {
    owner: {
      email: 'owner@test.com',
      firstName: 'John',
      lastName: 'Owner',
      role: 'OWNER' as const,
      isVerified: true,
    },
    sitter: {
      email: 'sitter@test.com',
      firstName: 'Jane',
      lastName: 'Sitter',
      role: 'SITTER' as const,
      isVerified: true,
    },
  },
  pets: {
    dog: {
      name: 'Buddy',
      type: 'DOG' as const,
      breed: 'Golden Retriever',
      age: 3,
      weight: 25.5,
      specialNeeds: null,
      photos: [],
    },
    cat: {
      name: 'Whiskers',
      type: 'CAT' as const,
      breed: 'Persian',
      age: 2,
      weight: 4.5,
      specialNeeds: 'Special diet',
      photos: [],
    },
  },
  bookings: {
    pending: {
      startDate: new Date('2024-01-01T10:00:00Z'),
      endDate: new Date('2024-01-01T18:00:00Z'),
      status: 'PENDING' as const,
      totalAmount: 200.00,
      specialInstructions: 'Feed twice daily',
      location: '123 Main St, City',
      hourlyRate: 25.00,
    },
    confirmed: {
      startDate: new Date('2024-01-02T10:00:00Z'),
      endDate: new Date('2024-01-02T18:00:00Z'),
      status: 'CONFIRMED' as const,
      totalAmount: 200.00,
      specialInstructions: 'Regular care',
      location: '456 Oak Ave, Town',
      hourlyRate: 30.00,
    },
  },
};

// Global test configuration
export const testConfig = {
  timeout: 30000,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1h',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  quantum: {
    encryptionKey: process.env.QUANTUM_ENCRYPTION_KEY,
  },
};

console.log('🧪 Integration test setup completed successfully!');

