# Monitoring and Logging Implementation

This document describes the monitoring and logging system implemented for the Google Maps Extractor application.

## Overview

The application now includes comprehensive monitoring and logging capabilities using:

- **Winston**: Structured logging with multiple transports
- **Sentry**: Error tracking and performance monitoring
- **Performance Monitor**: Custom performance monitoring for operations

## Features Implemented

### 1. Structured Logging with Winston

Winston provides structured logging with multiple outputs:

- **Console**: Colored, formatted logs for development
- **File Logs**:
  - `error.log`: Error-level logs only
  - `combined.log`: All logs
  - `application.log`: Application-level logs
  - `exceptions.log`: Unhandled exceptions
  - `rejections.log`: Unhandled promise rejections

**Configuration**: `src/common/logging/winston.config.ts`

### 2. Error Tracking with Sentry

Sentry integration provides:

- Automatic error capture and reporting
- Performance monitoring with transaction tracing
- Profiling support
- Sensitive data filtering (passwords, auth tokens)
- Context enrichment (request data, user info)

**Configuration**: `src/common/logging/sentry.config.ts`

### 3. HTTP Request Logging

The `LoggingInterceptor` automatically logs all HTTP requests and responses:

- Request details (method, URL, IP, user agent)
- Response details (status code, duration)
- Error responses with error messages

**Implementation**: `src/common/logging/logging.interceptor.ts`

### 4. Performance Monitoring

The `PerformanceMonitor` service provides utilities to measure operation performance:

- `measureAsync()`: Measure async operations
- `measureSync()`: Measure synchronous operations
- `startMeasure()` / `endMeasure()`: Manual performance measurement
- Automatic logging of slow operations (>5 seconds)

**Implementation**: `src/common/logging/performance.monitor.ts`

### 5. Sentry Exception Filter

Global exception filter that:

- Captures all exceptions
- Logs errors with context
- Sends 5xx errors to Sentry
- Enriches Sentry events with request data and user info
- Sanitizes sensitive headers

**Implementation**: `src/common/logging/sentry.filter.ts`

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Logging Configuration
LOG_LEVEL=info                        # Log level: error, warn, info, debug
LOG_DIR=logs                          # Directory for log files

# Sentry Configuration (Error Tracking)
SENTRY_DSN=your-sentry-dsn-here
SENTRY_TRACES_SAMPLE_RATE=0.1        # 10% of transactions for performance monitoring
SENTRY_PROFILES_SAMPLE_RATE=0.1      # 10% for profiling

# Performance Monitoring
ENABLE_PERFORMANCE_MONITORING=false   # Enable performance monitoring
```

### Setting up Sentry

1. Create a Sentry account at [sentry.io](https://sentry.io)
2. Create a new project for Node.js
3. Copy the DSN from your project settings
4. Add the DSN to your `.env` file as `SENTRY_DSN`

## Usage Examples

### Using the Performance Monitor

```typescript
import { PerformanceMonitor } from './common/logging/performance.monitor';

@Injectable()
export class MyService {
  constructor(private performanceMonitor: PerformanceMonitor) {}

  async myOperation() {
    // Option 1: Using measureAsync
    const result = await this.performanceMonitor.measureAsync(
      'my-operation',
      async () => {
        // Your async operation here
        return await someAsyncTask();
      }
    );

    // Option 2: Manual measurement
    this.performanceMonitor.startMeasure('my-operation');
    // Your operation here
    this.performanceMonitor.endMeasure('my-operation');
  }
}
```

### Custom Logging

All NestJS services now use Winston for logging:

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  myMethod() {
    this.logger.log('Info message');
    this.logger.warn('Warning message');
    this.logger.error('Error message');
    this.logger.debug('Debug message');

    // Structured logging
    this.logger.log({
      message: 'User action',
      userId: '123',
      action: 'create',
    });
  }
}
```

### Error Context in Sentry

Sentry automatically captures:

- HTTP request details
- User information (if authenticated)
- Stack traces
- Custom context

You can add additional context:

```typescript
import { Sentry } from './common/logging/sentry.config';

try {
  // Your code
} catch (error) {
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'extraction');
    scope.setContext('extraction', {
      keyword: 'test',
      maxResults: 50,
    });
    Sentry.captureException(error);
  });
  throw error;
}
```

## Log Files

Log files are stored in the directory specified by `LOG_DIR` (default: `logs/`):

- **error.log**: 5MB max, 5 files rotation
- **combined.log**: 5MB max, 5 files rotation
- **application.log**: 5MB max, 10 files rotation
- **exceptions.log**: Unhandled exceptions
- **rejections.log**: Unhandled promise rejections

> **Note**: The `logs/` directory is already in `.gitignore` to prevent committing log files.

## Architecture Integration

The monitoring and logging system is integrated at the application level:

1. **App Module** (`src/app.module.ts`):
   - Winston module configured globally
   - Performance monitor provided as a service
   - Logging interceptor applied globally
   - Sentry filter applied globally

2. **Main Bootstrap** (`src/main.ts`):
   - Sentry initialized before app creation
   - Winston logger set as the default NestJS logger

3. **Services**:
   - Extraction service uses performance monitoring
   - All services use NestJS Logger (backed by Winston)

## Performance Impact

The monitoring system is designed to have minimal performance impact:

- Winston uses non-blocking I/O for file writes
- Performance monitoring can be disabled via environment variable
- Sentry sampling rates can be adjusted (default: 10%)
- HTTP logging is asynchronous

## Monitoring in Production

### Recommended Settings

```env
# Production
NODE_ENV=production
LOG_LEVEL=info
ENABLE_PERFORMANCE_MONITORING=false
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1
```

### Recommended Practices

1. **Monitor Sentry Dashboard**: Check for errors and performance issues regularly
2. **Log Rotation**: Ensure log files are rotated and archived
3. **Disk Space**: Monitor disk space for log files
4. **Alerts**: Set up alerts in Sentry for critical errors
5. **Performance**: Review slow operations in logs and Sentry

## Testing

All monitoring and logging features have been tested:

- ✅ Backend builds successfully
- ✅ All tests pass (55/55)
- ✅ ESLint passes with no errors
- ✅ Prettier formatting applied
- ✅ Frontend builds successfully

## Troubleshooting

### Sentry Not Initializing

If you see "Sentry DSN not provided" warning:
- Ensure `SENTRY_DSN` is set in your `.env` file
- Verify the DSN is correct
- Check that the `.env` file is being loaded

### Logs Not Being Written

If log files are not created:
- Check `LOG_DIR` environment variable
- Verify the application has write permissions
- Check for errors in application startup

### Performance Monitoring Not Working

If performance measurements aren't logged:
- Ensure `ENABLE_PERFORMANCE_MONITORING=true` in `.env`
- Check that the logger is initialized
- Verify the operation name is unique

## Future Enhancements

Potential improvements for the monitoring system:

1. **Metrics Collection**: Add Prometheus metrics
2. **Distributed Tracing**: Add OpenTelemetry support
3. **Log Aggregation**: Integrate with ELK stack or similar
4. **Custom Dashboards**: Create Grafana dashboards
5. **Alert System**: Email/Slack alerts for critical errors

## References

- [Winston Documentation](https://github.com/winstonjs/winston)
- [Sentry Node.js SDK](https://docs.sentry.io/platforms/node/)
- [NestJS Logger](https://docs.nestjs.com/techniques/logger)
- [Node.js Performance Hooks](https://nodejs.org/api/perf_hooks.html)
