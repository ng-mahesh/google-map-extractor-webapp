import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';

@Catch()
export class SentryFilter implements ExceptionFilter {
  private readonly logger = new Logger(SentryFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message || 'An error occurred';
        error = (exceptionResponse as any).error || exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Log the error
    this.logger.error({
      message,
      error,
      status,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    // Send to Sentry if it's a server error (5xx) or unhandled exception
    if (status >= 500 || !(exception instanceof HttpException)) {
      Sentry.withScope((scope) => {
        scope.setTag('path', request.url);
        scope.setTag('method', request.method);
        scope.setContext('request', {
          url: request.url,
          method: request.method,
          headers: this.sanitizeHeaders(request.headers),
          query: request.query,
          params: request.params,
        });

        if (request.user) {
          scope.setUser({
            id: (request.user as any).userId || (request.user as any).id,
            email: (request.user as any).email,
          });
        }

        Sentry.captureException(exception);
      });
    }

    // Send error response
    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    // Remove sensitive headers
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized['x-api-key'];
    return sanitized;
  }
}
