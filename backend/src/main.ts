import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { initializeSentry } from './common/logging/sentry.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SentryFilter } from './common/logging/sentry.filter';

async function bootstrap() {
  // Initialize Sentry before creating the app
  initializeSentry();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Use Winston logger
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = error.constraints;
          return constraints ? Object.values(constraints).join(', ') : 'Validation failed';
        });
        logger.error(`Validation errors: ${messages.join('; ')}`);
        return new ValidationPipe({}).createExceptionFactory()(errors);
      },
    }),
  );

  // Apply exception filters (order matters: specific first, then general)
  app.useGlobalFilters(new HttpExceptionFilter(), new SentryFilter());

  // Set global prefix for API routes only (excludes /uploads)
  app.setGlobalPrefix('api', {
    exclude: ['/uploads/(.*)'],
  });

  // Serve static files AFTER setting global prefix
  // In development, __dirname is 'dist', so we need to go up one more level to reach project root
  const uploadsPath = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 Backend server is running on: http://localhost:${port}/api`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`Logging to: ${process.env.LOG_DIR || 'logs'} directory`);
  logger.log(`📁 Serving static files from: ${uploadsPath}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
