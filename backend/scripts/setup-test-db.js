const { PrismaClient } = require('@prisma/client');

async function setupTestDatabase() {
  console.log('🧪 Setting up test database...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://postgres:postgres@localhost:5432/pawfectradar_test?schema=public'
      }
    }
  });

  try {
    // Test the connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User'
      }
    });
    console.log('✅ Test user created:', testUser.email);
    
    // Create a test pet
    const testPet = await prisma.pet.create({
      data: {
        name: 'Buddy',
        type: 'Dog',
        breed: 'Golden Retriever',
        ownerId: testUser.id
      }
    });
    console.log('✅ Test pet created:', testPet.name);
    
    console.log('🎉 Test database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestDatabase();
