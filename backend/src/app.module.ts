import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExtractionModule } from './extraction/extraction.module';
import { ScraperModule } from './scraper/scraper.module';
import { UploadModule } from './upload/upload.module';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';
import { winstonConfig } from './common/logging/winston.config';
import { LoggingModule } from './common/logging/logging.module';
import { LoggingInterceptor } from './common/logging/logging.interceptor';
import { SentryFilter } from './common/logging/sentry.filter';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Logging
    WinstonModule.forRoot(winstonConfig),
    LoggingModule,

    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: parseInt(configService.get<string>('THROTTLE_TTL') || '60000'), // 1 minute default
          limit: parseInt(configService.get<string>('THROTTLE_LIMIT') || '10'), // 10 requests default
        },
      ],
      inject: [ConfigService],
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    ExtractionModule,
    ScraperModule,
    UploadModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: SentryFilter,
    },
  ],
})
export class AppModule {}
