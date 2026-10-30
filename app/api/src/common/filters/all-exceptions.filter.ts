import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodValidationException } from 'nestjs-zod';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    // Guard against replies that were already terminated/sent (e.g. streaming)
    if (response?.sent || (response as any)?.raw?.headersSent) {
      return;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const path = request?.url || request?.raw?.url || '';

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let errors: any = undefined;
    let stack: string | undefined = undefined;

    if (
      exception instanceof ZodValidationException ||
      (exception as any)?.name === 'ZodValidationException'
    ) {
      statusCode = HttpStatus.BAD_REQUEST;
      error = 'Bad Request';
      message = 'Validation failed';

      const zodError =
        (exception as any).getZodError?.() || (exception as any).zodError;

      if (zodError?.issues && Array.isArray(zodError.issues)) {
        errors = zodError.issues.map((issue: any) => ({
          field: issue.path?.length > 0 ? issue.path.join('.') : undefined,
          message: issue.message,
          code: issue.code,
        }));
      } else {
        const res = (exception as any).getResponse?.();
        errors = res?.errors ?? [];
      }
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        error = (HttpStatus[statusCode] as string) || 'Error';
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        error = resObj.error || (HttpStatus[statusCode] as string) || 'Error';

        if (Array.isArray(resObj.message)) {
          message = 'Validation failed';
          errors = resObj.message;
        } else if (typeof resObj.message === 'string') {
          message = resObj.message;
        } else {
          message = exception.message;
        }

        if (resObj.errors) {
          errors = resObj.errors;
        }
      }
    } else if ((exception as any)?.code?.startsWith?.('P')) {
      // Prisma Client Known Request Error handling
      const prismaError = exception as any;
      switch (prismaError.code) {
        case 'P2002': {
          statusCode = HttpStatus.CONFLICT;
          error = 'Conflict';
          const target = Array.isArray(prismaError.meta?.target)
            ? prismaError.meta.target.join(', ')
            : (prismaError.meta?.target as string) || 'field';
          message = `A record with this ${target} already exists`;
          break;
        }
        case 'P2025': {
          statusCode = HttpStatus.NOT_FOUND;
          error = 'Not Found';
          message =
            (prismaError.meta?.cause as string) ||
            'The requested record was not found';
          break;
        }
        case 'P2003': {
          statusCode = HttpStatus.BAD_REQUEST;
          error = 'Bad Request';
          message = 'Foreign key constraint failed on the database';
          break;
        }
        default: {
          statusCode = HttpStatus.BAD_REQUEST;
          error = 'Database Error';
          message = isProduction
            ? 'A database error occurred'
            : prismaError.message || 'Database operation failed';
          break;
        }
      }
    } else if (exception instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      error = 'Internal Server Error';
      message = isProduction
        ? 'An unexpected error occurred. Please try again later.'
        : exception.message || 'Internal server error';
      stack = isProduction ? undefined : exception.stack;
    }

    // Structured logging
    const logContext = `${request?.method ?? 'UNKNOWN'} ${path}`;
    if (statusCode >= 500) {
      this.logger.error(
        `[${logContext}] ${statusCode} - ${message}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
    } else {
      this.logger.warn(`[${logContext}] ${statusCode} - ${message}`);
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode,
      message,
      error,
      ...(errors !== undefined ? { errors } : {}),
      timestamp: new Date().toISOString(),
      path,
      ...(stack ? { stack } : {}),
    };

    response.status(statusCode).send(errorResponse);
  }
}

// Convenient aliases for developers preferring different naming conventions
export {
  AllExceptionsFilter as HttpExceptionFilter,
  AllExceptionsFilter as GlobalExceptionFilter,
};
