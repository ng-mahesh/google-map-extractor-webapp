import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    let message: string | string[];

    // Handle validation errors from class-validator
    if (exception instanceof BadRequestException && typeof exceptionResponse === 'object') {
      const responseBody = exceptionResponse as any;

      if (Array.isArray(responseBody.message)) {
        // Extract validation error messages
        message = responseBody.message;
      } else if (typeof responseBody.message === 'string') {
        message = responseBody.message;
      } else {
        message = 'Bad request';
      }
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      message = (exceptionResponse as any).message;
    } else {
      message = exception.message;
    }

    // Format the error response
    const errorResponse = {
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message, // Send first error message
      errors: Array.isArray(message) ? message : undefined, // Include all errors if multiple
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
