import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of, lastValueFrom } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';
import { BYPASS_TRANSFORM_METADATA } from '../decorators/bypass-transform.decorator';
import { RESPONSE_MESSAGE_METADATA } from '../decorators/response-message.decorator';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    interceptor = new TransformInterceptor(reflector);
  });

  const createMockContext = (
    url = '/api/v1/resource',
    statusCode = 200,
  ): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ url }),
        getResponse: () => ({ statusCode }),
      }),
    } as unknown as ExecutionContext;
  };

  const createMockCallHandler = (data: any): CallHandler => ({
    handle: () => of(data),
  });

  it('should transform data into standard ApiResponse envelope', async () => {
    const context = createMockContext('/api/v1/test', 200);
    const handler = createMockCallHandler({ id: '1', name: 'Antigravity' });

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const result$ = interceptor.intercept(context, handler);
    const result = await lastValueFrom(result$);

    expect(result).toEqual({
      success: true,
      statusCode: 200,
      message: 'Success',
      data: { id: '1', name: 'Antigravity' },
      timestamp: expect.any(String),
      path: '/api/v1/test',
    });
  });

  it('should use custom message when @ResponseMessage() is provided', async () => {
    const context = createMockContext('/api/v1/auth/register', 201);
    const handler = createMockCallHandler({ id: 'user-1' });

    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === RESPONSE_MESSAGE_METADATA) return 'User registered successfully';
      return undefined;
    });

    const result$ = interceptor.intercept(context, handler);
    const result = await lastValueFrom(result$);

    expect(result).toMatchObject({
      success: true,
      statusCode: 201,
      message: 'User registered successfully',
      data: { id: 'user-1' },
      path: '/api/v1/auth/register',
    });
  });

  it('should extract message from object and set data to null when message is the sole property', async () => {
    const context = createMockContext('/api/v1/auth/logout', 200);
    const handler = createMockCallHandler({ message: 'Logged out successfully' });

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const result$ = interceptor.intercept(context, handler);
    const result = await lastValueFrom(result$);

    expect(result).toMatchObject({
      success: true,
      statusCode: 200,
      message: 'Logged out successfully',
      data: null,
      path: '/api/v1/auth/logout',
    });
  });

  it('should extract message from object and keep remaining data when other properties exist', async () => {
    const context = createMockContext('/api/v1/action', 200);
    const handler = createMockCallHandler({
      message: 'Operation finished',
      extraInfo: 'extra',
    });

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const result$ = interceptor.intercept(context, handler);
    const result = await lastValueFrom(result$);

    expect(result).toMatchObject({
      success: true,
      statusCode: 200,
      message: 'Operation finished',
      data: { extraInfo: 'extra' },
      path: '/api/v1/action',
    });
  });

  it('should bypass transformation if @BypassTransform() is present', async () => {
    const context = createMockContext('/api/v1/raw-data', 200);
    const rawData = 'raw-unformatted-string';
    const handler = createMockCallHandler(rawData);

    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === BYPASS_TRANSFORM_METADATA) return true;
      return undefined;
    });

    const result$ = interceptor.intercept(context, handler);
    const result = await lastValueFrom(result$);

    expect(result).toBe(rawData);
  });

  it('should automatically bypass transformation for swagger docs endpoints', async () => {
    const context = createMockContext('/api/v1/docs-json', 200);
    const swaggerDoc = { openapi: '3.0.0', info: {} };
    const handler = createMockCallHandler(swaggerDoc);

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const result$ = interceptor.intercept(context, handler);
    const result = await lastValueFrom(result$);

    expect(result).toBe(swaggerDoc);
  });

  it('should not double-wrap an already wrapped ApiResponse', async () => {
    const context = createMockContext('/api/v1/test', 200);
    const alreadyWrapped = {
      success: true,
      statusCode: 200,
      message: 'Custom',
      data: { some: 'data' },
      timestamp: '2026-10-30T00:00:00.000Z',
      path: '/api/v1/test',
    };
    const handler = createMockCallHandler(alreadyWrapped);

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const result$ = interceptor.intercept(context, handler);
    const result = await lastValueFrom(result$);

    expect(result).toBe(alreadyWrapped);
  });

  it('should handle null and undefined data gracefully', async () => {
    const context = createMockContext('/api/v1/empty', 204);
    const handler = createMockCallHandler(null);

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const result$ = interceptor.intercept(context, handler);
    const result = await lastValueFrom(result$);

    expect(result).toMatchObject({
      success: true,
      statusCode: 204,
      message: 'No Content',
      data: null,
    });
  });
});
