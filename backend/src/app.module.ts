import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import * as Joi from 'joi';

@Module({
  imports: [
    // 🔧 CONFIGURATION: Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.quantum', '.env'],
      validationSchema: Joi.object({
        PORT: Joi.number().default(3001),
        NODE_ENV: Joi.string().default('development'),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        QUANTUM_ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000')
      })
    }),

    // 🚀 THROTTLING: Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // 🏥 HEALTH: Health checks
    TerminusModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
