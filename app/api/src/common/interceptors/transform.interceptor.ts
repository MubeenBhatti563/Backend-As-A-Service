import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BYPASS_TRANSFORM_METADATA } from '../decorators/bypass-transform.decorator';
import { RESPONSE_MESSAGE_METADATA } from '../decorators/response-message.decorator';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | T>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | T> {
    const isBypassed = this.reflector.getAllAndOverride<boolean>(
      BYPASS_TRANSFORM_METADATA,
      [context.getHandler(), context.getClass()],
    );

    if (isBypassed) {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<FastifyRequest>();
    const response = httpContext.getResponse<FastifyReply>();

    const url = request?.url || request?.raw?.url || '';

    // Automatically bypass swagger documentation and openapi specs
    if (url.includes('/docs') || url.includes('/docs-json')) {
      return next.handle();
    }

    const customMessage = this.reflector.getAllAndOverride<string>(
      RESPONSE_MESSAGE_METADATA,
      [context.getHandler(), context.getClass()],
    );

    return next.handle().pipe(
      map((data) => {
        // If data is already transformed into the standard envelope format, don't double wrap
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'statusCode' in data &&
          'data' in data
        ) {
          return data;
        }

        const statusCode = response?.statusCode ?? 200;
        let message = customMessage;
        let transformedData = data;

        // If data is an object with a `message` property (e.g. { message: 'Logged out' })
        if (
          data &&
          typeof data === 'object' &&
          !Array.isArray(data) &&
          'message' in data &&
          typeof (data as any).message === 'string'
        ) {
          const { message: extractedMessage, ...remainingData } = data as any;
          if (!message) {
            message = extractedMessage;
          }

          if (Object.keys(remainingData).length === 0) {
            transformedData = null;
          } else {
            transformedData = remainingData;
          }
        }

        if (!message) {
          message = this.getDefaultMessage(statusCode);
        }

        return {
          success: true,
          statusCode,
          message,
          data: transformedData !== undefined ? transformedData : null,
          timestamp: new Date().toISOString(),
          path: url,
        };
      }),
    );
  }

  private getDefaultMessage(statusCode: number): string {
    switch (statusCode) {
      case 200:
        return 'Success';
      case 201:
        return 'Created successfully';
      case 202:
        return 'Accepted';
      case 204:
        return 'No Content';
      default:
        return 'Success';
    }
  }
}
