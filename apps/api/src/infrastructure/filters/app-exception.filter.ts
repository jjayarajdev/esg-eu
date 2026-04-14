import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '@esg/shared-kernel';

/**
 * Global exception filter.
 * Maps AppError hierarchy and NestJS HttpExceptions to consistent API error responses.
 */
@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = (request.headers['x-request-id'] as string) || uuidv4();
    const timestamp = new Date().toISOString();

    let statusCode: number;
    let code: string;
    let message: string;
    let details: Array<{ field: string; issue: string }> | undefined;

    if (exception instanceof AppError) {
      statusCode = exception.statusCode;
      code = exception.code;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exResponse = exception.getResponse();
      code = `HTTP_${statusCode}`;
      message =
        typeof exResponse === 'string'
          ? exResponse
          : (exResponse as Record<string, unknown>).message?.toString() ||
            exception.message;
    } else {
      statusCode = 500;
      code = 'INTERNAL_SERVER_ERROR';
      message = 'An unexpected error occurred';
      // Log the actual error but don't expose internals
      console.error('Unhandled exception:', exception);
    }

    response.status(statusCode).json({
      error: {
        code,
        message,
        ...(details && { details }),
      },
      meta: {
        requestId,
        timestamp,
      },
    });
  }
}
