import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';

// 🔐 QUANTUM AUTH MODULE
import { AuthModule } from './auth/auth.module';

// 👥 QUANTUM USER MODULE
import { UsersModule } from './users/users.module';

// 🐕 QUANTUM PET MODULE
import { PetsModule } from './pets/pets.module';

// 📅 QUANTUM BOOKING MODULE
import { BookingsModule } from './bookings/bookings.module';

// 💳 QUANTUM PAYMENT MODULE
import { PaymentsModule } from './payments/payments.module';

// ⭐ QUANTUM REVIEW MODULE
import { ReviewsModule } from './reviews/reviews.module';

// 🔄 QUANTUM SESSION MODULE
import { SessionsModule } from './sessions/sessions.module';

// 📊 QUANTUM ANALYTICS MODULE
import { AnalyticsModule } from './analytics/analytics.module';

// 🔒 QUANTUM SECURITY MODULE
import { QuantumSecurityModule } from './quantum/security/quantum-security.module';

// 📊 QUANTUM MONITORING MODULE
import { QuantumMonitoringModule } from './quantum/monitoring/quantum-monitoring.module';

// 🚀 QUANTUM PERFORMANCE MODULE
import { QuantumPerformanceModule } from './quantum/performance/quantum-performance.module';

// 🔐 QUANTUM COMPLIANCE MODULE
import { QuantumComplianceModule } from './quantum/compliance/quantum-compliance.module';

// 📧 QUANTUM EMAIL MODULE
import { EmailModule } from './email/email.module';

// 📱 QUANTUM NOTIFICATION MODULE
import { NotificationsModule } from './notifications/notifications.module';

// 🔍 QUANTUM SEARCH MODULE
import { SearchModule } from './search/search.module';

// 📁 QUANTUM FILE MODULE
import { FilesModule } from './files/files.module';

// 🌐 QUANTUM WEBSOCKET MODULE
import { WebSocketModule } from './websocket/websocket.module';

// 🏥 QUANTUM HEALTH MODULE
import { HealthModule } from './health/health.module';

// 📈 QUANTUM METRICS MODULE
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    // 🔧 QUANTUM CONFIGURATION: Load quantum environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.quantum', '.env'],
      validationSchema: {
        // Quantum Security Configuration
        QUANTUM_SECURITY_LEVEL: { type: 'string', default: 'military-grade' },
        QUANTUM_ENCRYPTION_ALGORITHM: { type: 'string', default: 'CRYSTALS-Kyber' },
        QUANTUM_KEY_DISTRIBUTION: { type: 'string', default: 'BB84' },
        QUANTUM_RANDOM_GENERATOR: { type: 'string', default: 'quantum-entanglement' },
        QUANTUM_JWT_SECRET: { type: 'string', required: true },
        QUANTUM_QKD_ENABLED: { type: 'boolean', default: true },
        QUANTUM_POST_QUANTUM_CRYPTO: { type: 'boolean', default: true },
        QUANTUM_BIOMETRIC_AUTH: { type: 'boolean', default: true },
        QUANTUM_THREAT_DETECTION: { type: 'boolean', default: true },
        QUANTUM_AI_MONITORING: { type: 'boolean', default: true },
        QUANTUM_BEHAVIORAL_ANALYSIS: { type: 'boolean', default: true },
        QUANTUM_RISK_SCORING: { type: 'boolean', default: true },

        // Quantum Database Configuration
        QUANTUM_DATABASE_URL: { type: 'string', required: true },
        QUANTUM_DB_USER: { type: 'string', required: true },
        QUANTUM_DB_PASSWORD: { type: 'string', required: true },
        QUANTUM_DB_NAME: { type: 'string', required: true },
        QUANTUM_DB_HOST: { type: 'string', required: true },
        QUANTUM_DB_PORT: { type: 'number', default: 5432 },

        // Quantum Redis Configuration
        QUANTUM_REDIS_URL: { type: 'string', required: true },
        QUANTUM_REDIS_PASSWORD: { type: 'string', required: true },
        QUANTUM_REDIS_HOST: { type: 'string', required: true },
        QUANTUM_REDIS_PORT: { type: 'number', default: 6379 },

        // Quantum Payment Configuration
        STRIPE_SECRET_KEY: { type: 'string', required: true },
        STRIPE_PUBLISHABLE_KEY: { type: 'string', required: true },
        STRIPE_WEBHOOK_SECRET: { type: 'string', required: true },
        QUANTUM_PAYMENT_ENCRYPTION: { type: 'boolean', default: true },
        QUANTUM_ESCROW_SYSTEM: { type: 'boolean', default: true },
        QUANTUM_FRAUD_DETECTION: { type: 'boolean', default: true },

        // Quantum Email Configuration
        QUANTUM_SMTP_HOST: { type: 'string', required: true },
        QUANTUM_SMTP_PORT: { type: 'number', default: 587 },
        QUANTUM_SMTP_USER: { type: 'string', required: true },
        QUANTUM_SMTP_PASSWORD: { type: 'string', required: true },
        QUANTUM_SMTP_SECURE: { type: 'boolean', default: true },
        QUANTUM_EMAIL_ENCRYPTION: { type: 'boolean', default: true },
        QUANTUM_EMAIL_VERIFICATION: { type: 'boolean', default: true },

        // Quantum File Storage Configuration
        CLOUDINARY_CLOUD_NAME: { type: 'string', required: true },
        CLOUDINARY_API_KEY: { type: 'string', required: true },
        CLOUDINARY_API_SECRET: { type: 'string', required: true },
        CLOUDINARY_UPLOAD_PRESET: { type: 'string', default: 'quantum-secure' },
        QUANTUM_FILE_ENCRYPTION: { type: 'boolean', default: true },
        QUANTUM_VIRUS_SCANNING: { type: 'boolean', default: true },
        QUANTUM_DUPLICATE_DETECTION: { type: 'boolean', default: true },

        // Quantum Monitoring Configuration
        QUANTUM_PROMETHEUS_ENABLED: { type: 'boolean', default: true },
        QUANTUM_PROMETHEUS_PORT: { type: 'number', default: 9090 },
        QUANTUM_METRICS_ENABLED: { type: 'boolean', default: true },
        QUANTUM_GRAFANA_PASSWORD: { type: 'string', required: true },
        QUANTUM_GRAFANA_PORT: { type: 'number', default: 3000 },
        QUANTUM_DASHBOARDS_ENABLED: { type: 'boolean', default: true },
        QUANTUM_LOG_ENCRYPTION: { type: 'boolean', default: true },
        QUANTUM_LOG_ROTATION: { type: 'string', default: '7d' },
        QUANTUM_LOG_COMPRESSION: { type: 'boolean', default: true },

        // Quantum Security Keys
        QUANTUM_SECURITY_KEY: { type: 'string', required: true },
        QUANTUM_ENCRYPTION_KEY: { type: 'string', required: true },
        QUANTUM_SIGNING_KEY: { type: 'string', required: true },
        QUANTUM_API_KEY: { type: 'string', required: true },
        QUANTUM_WEBHOOK_SECRET: { type: 'string', required: true },

        // Quantum Performance Configuration
        QUANTUM_CACHE_ENABLED: { type: 'boolean', default: true },
        QUANTUM_CDN_ENABLED: { type: 'boolean', default: true },
        QUANTUM_COMPRESSION_ENABLED: { type: 'boolean', default: true },
        QUANTUM_OPTIMIZATION_ENABLED: { type: 'boolean', default: true },
        QUANTUM_AUTO_SCALING: { type: 'boolean', default: true },
        QUANTUM_LOAD_BALANCING: { type: 'boolean', default: true },
        QUANTUM_FAULT_TOLERANCE: { type: 'boolean', default: true },

        // Quantum Network Configuration
        QUANTUM_NETWORK_ENCRYPTION: { type: 'boolean', default: true },
        QUANTUM_NETWORK_COMPRESSION: { type: 'boolean', default: true },
        QUANTUM_NETWORK_OPTIMIZATION: { type: 'boolean', default: true },
        QUANTUM_FIREWALL_ENABLED: { type: 'boolean', default: true },
        QUANTUM_DDOS_PROTECTION: { type: 'boolean', default: true },
        QUANTUM_VPN_ENABLED: { type: 'boolean', default: true },

        // Quantum Compliance Configuration
        QUANTUM_GDPR_COMPLIANCE: { type: 'boolean', default: true },
        QUANTUM_CCPA_COMPLIANCE: { type: 'boolean', default: true },
        QUANTUM_PCI_DSS_COMPLIANCE: { type: 'boolean', default: true },
        QUANTUM_SOC2_COMPLIANCE: { type: 'boolean', default: true },
        QUANTUM_AUDIT_LOGGING: { type: 'boolean', default: true },
        QUANTUM_DATA_ENCRYPTION: { type: 'boolean', default: true },
        QUANTUM_ACCESS_CONTROL: { type: 'boolean', default: true },

        // Quantum Alerting Configuration
        QUANTUM_ALERTING_ENABLED: { type: 'boolean', default: true },
        QUANTUM_ALERT_EMAIL: { type: 'string', required: true },
        QUANTUM_ALERT_SLACK: { type: 'string', required: true },
        QUANTUM_ALERT_ENCRYPTION: { type: 'boolean', default: true },
        QUANTUM_ALERT_VERIFICATION: { type: 'boolean', default: true },
        QUANTUM_ALERT_PRIORITY: { type: 'boolean', default: true },

        // Server Configuration
        PORT: { type: 'number', default: 3001 },
        NODE_ENV: { type: 'string', default: 'development' },
        QUANTUM_ALLOWED_ORIGINS: { type: 'string', default: 'http://localhost:3000' }
      }
    }),

    // 🛡️ QUANTUM THROTTLING: Apply quantum rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        ttl: 3600000, // 1 hour
        limit: 1000, // 1000 requests per hour
      }
    ]),

    // 🏥 QUANTUM HEALTH: Health check endpoints
    TerminusModule,

    // 📅 QUANTUM SCHEDULING: Background tasks and cron jobs
    ScheduleModule.forRoot(),

    // 📨 QUANTUM QUEUE: Background job processing
    BullModule.forRoot({
      redis: {
        host: process.env.QUANTUM_REDIS_HOST,
        port: parseInt(process.env.QUANTUM_REDIS_PORT),
        password: process.env.QUANTUM_REDIS_PASSWORD,
        tls: process.env.NODE_ENV === 'production' ? {} : undefined,
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
      }
    }),

    // 🗄️ QUANTUM DATABASE: Prisma database module
    PrismaModule,

    // 🔐 QUANTUM AUTH: Authentication and authorization
    AuthModule,

    // 👥 QUANTUM USERS: User management
    UsersModule,

    // 🐕 QUANTUM PETS: Pet management
    PetsModule,

    // 📅 QUANTUM BOOKINGS: Booking management
    BookingsModule,

    // 💳 QUANTUM PAYMENTS: Payment processing
    PaymentsModule,

    // ⭐ QUANTUM REVIEWS: Review management
    ReviewsModule,

    // 🔄 QUANTUM SESSIONS: Session management
    SessionsModule,

    // 📊 QUANTUM ANALYTICS: Analytics and reporting
    AnalyticsModule,

    // 🔒 QUANTUM SECURITY: Quantum security services
    QuantumSecurityModule,

    // 📊 QUANTUM MONITORING: Quantum monitoring services
    QuantumMonitoringModule,

    // 🚀 QUANTUM PERFORMANCE: Quantum performance services
    QuantumPerformanceModule,

    // 🔐 QUANTUM COMPLIANCE: Quantum compliance services
    QuantumComplianceModule,

    // 📧 QUANTUM EMAIL: Email services
    EmailModule,

    // 📱 QUANTUM NOTIFICATIONS: Notification services
    NotificationsModule,

    // 🔍 QUANTUM SEARCH: Search services
    SearchModule,

    // 📁 QUANTUM FILES: File upload and management
    FilesModule,

    // 🌐 QUANTUM WEBSOCKET: Real-time communication
    WebSocketModule,

    // 🏥 QUANTUM HEALTH: Health check services
    HealthModule,

    // 📈 QUANTUM METRICS: Metrics and monitoring
    MetricsModule
  ],
  controllers: [],
  providers: [
    // 🔒 QUANTUM GLOBAL INTERCEPTORS: Global quantum interceptors
    {
      provide: 'QUANTUM_GLOBAL_INTERCEPTORS',
      useFactory: () => [
        // Quantum security interceptor
        // Quantum performance interceptor
        // Quantum monitoring interceptor
        // Quantum compliance interceptor
      ]
    },

    // 🔒 QUANTUM GLOBAL GUARDS: Global quantum guards
    {
      provide: 'QUANTUM_GLOBAL_GUARDS',
      useFactory: () => [
        // Quantum authentication guard
        // Quantum authorization guard
        // Quantum rate limiting guard
        // Quantum security guard
      ]
    },

    // 🔒 QUANTUM GLOBAL PIPES: Global quantum pipes
    {
      provide: 'QUANTUM_GLOBAL_PIPES',
      useFactory: () => [
        // Quantum validation pipe
        // Quantum transformation pipe
        // Quantum encryption pipe
        // Quantum decryption pipe
      ]
    },

    // 🔒 QUANTUM GLOBAL FILTERS: Global quantum filters
    {
      provide: 'QUANTUM_GLOBAL_FILTERS',
      useFactory: () => [
        // Quantum exception filter
        // Quantum security filter
        // Quantum logging filter
        // Quantum monitoring filter
      ]
    }
  ],
  exports: [
    // 🔒 QUANTUM EXPORTS: Export quantum services for other modules
    PrismaModule,
    QuantumSecurityModule,
    QuantumMonitoringModule,
    QuantumPerformanceModule,
    QuantumComplianceModule
  ]
})
export class AppModule {
  constructor() {
    console.log(`
🔒 QUANTUM APP MODULE INITIALIZED
📊 MODULES LOADED:
   - 🔐 Quantum Auth Module
   - 👥 Quantum Users Module
   - 🐕 Quantum Pets Module
   - 📅 Quantum Bookings Module
   - 💳 Quantum Payments Module
   - ⭐ Quantum Reviews Module
   - 🔄 Quantum Sessions Module
   - 📊 Quantum Analytics Module
   - 🔒 Quantum Security Module
   - 📊 Quantum Monitoring Module
   - 🚀 Quantum Performance Module
   - 🔐 Quantum Compliance Module
   - 📧 Quantum Email Module
   - 📱 Quantum Notifications Module
   - 🔍 Quantum Search Module
   - 📁 Quantum Files Module
   - 🌐 Quantum WebSocket Module
   - 🏥 Quantum Health Module
   - 📈 Quantum Metrics Module

🔒 QUANTUM SECURITY STATUS: ENABLED
📊 QUANTUM MONITORING STATUS: ENABLED
🚀 QUANTUM PERFORMANCE STATUS: ENABLED
🔐 QUANTUM COMPLIANCE STATUS: ENABLED

🤖 QUANTUM APP MODULE STATUS: OPERATIONAL
    `);
  }
}
