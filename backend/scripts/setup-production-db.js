const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function setupProductionDatabase() {
  try {
    console.log('🔧 Setting up production database...');

    // 1. Run database migrations
    console.log('📦 Running database migrations...');
    const { execSync } = require('child_process');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    // 2. Generate Prisma client
    console.log('🔨 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // 3. Create admin user
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@pawfectradar.com' },
      update: {},
      create: {
        email: 'admin@pawfectradar.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isVerified: true,
        isActive: true
      }
    });

    // 4. Create default settings
    console.log('⚙️ Creating default settings...');
    await prisma.appSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        appName: 'PawfectRadar',
        version: '1.0.0',
        maintenanceMode: false,
        registrationEnabled: true,
        emailVerificationRequired: true,
        maxFileSize: 10485760, // 10MB
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
        defaultCurrency: 'USD',
        commissionRate: 0.15, // 15%
        minBookingDuration: 30, // minutes
        maxBookingDuration: 1440, // 24 hours
        autoApproveBookings: false,
        requireBackgroundCheck: true,
        emergencyContactRequired: true
      }
    });

    // 5. Create default service types
    console.log('🐕 Creating default service types...');
    const serviceTypes = [
      { name: 'Dog Walking', description: 'Regular dog walking services', basePrice: 25, icon: '🚶' },
      { name: 'Pet Sitting', description: 'In-home pet sitting services', basePrice: 35, icon: '🏠' },
      { name: 'Overnight Care', description: 'Overnight pet care services', basePrice: 50, icon: '🌙' },
      { name: 'Daycare', description: 'Pet daycare services', basePrice: 30, icon: '☀️' },
      { name: 'Grooming', description: 'Pet grooming services', basePrice: 45, icon: '✂️' },
      { name: 'Training', description: 'Pet training services', basePrice: 60, icon: '🎓' }
    ];

    for (const service of serviceTypes) {
      await prisma.serviceType.upsert({
        where: { name: service.name },
        update: {},
        create: service
      });
    }

    // 6. Create default verification levels
    console.log('🛡️ Creating verification levels...');
    const verificationLevels = [
      { name: 'Basic', description: 'Email and phone verification', requirements: ['email', 'phone'] },
      { name: 'Enhanced', description: 'ID verification and background check', requirements: ['email', 'phone', 'id', 'background_check'] },
      { name: 'Premium', description: 'Full verification with references', requirements: ['email', 'phone', 'id', 'background_check', 'references'] }
    ];

    for (const level of verificationLevels) {
      await prisma.verificationLevel.upsert({
        where: { name: level.name },
        update: {},
        create: level
      });
    }

    // 7. Create default notification templates
    console.log('📧 Creating notification templates...');
    const notificationTemplates = [
      {
        name: 'welcome_email',
        type: 'EMAIL',
        subject: 'Welcome to PawfectRadar!',
        content: 'Welcome to PawfectRadar! We\'re excited to have you on board.',
        isActive: true
      },
      {
        name: 'booking_confirmation',
        type: 'EMAIL',
        subject: 'Booking Confirmed',
        content: 'Your booking has been confirmed. Details: {{booking_details}}',
        isActive: true
      },
      {
        name: 'payment_received',
        type: 'EMAIL',
        subject: 'Payment Received',
        content: 'Payment of {{amount}} has been received for booking {{booking_id}}.',
        isActive: true
      }
    ];

    for (const template of notificationTemplates) {
      await prisma.notificationTemplate.upsert({
        where: { name: template.name },
        update: {},
        create: template
      });
    }

    console.log('✅ Production database setup completed successfully!');
    console.log('📧 Admin email: admin@pawfectradar.com');
    console.log('🔑 Admin password: admin123 (change this immediately!)');

  } catch (error) {
    console.error('❌ Error setting up production database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupProductionDatabase()
    .then(() => {
      console.log('🎉 Database setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupProductionDatabase };
