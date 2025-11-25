import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // Log incoming request
    this.logger.log({
      type: 'request',
      method,
      url,
      ip,
      userAgent,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const { statusCode } = response;
          const duration = Date.now() - startTime;

          // Log successful response
          this.logger.log({
            type: 'response',
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
          });
        },
        error: (error) => {
          const { statusCode } = response;
          const duration = Date.now() - startTime;

          // Log error response
          this.logger.error({
            type: 'error_response',
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            error: error.message,
          });
        },
      }),
    );
  }
}
