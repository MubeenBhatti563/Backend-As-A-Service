import {
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { ZodValidationException } from 'nestjs-zod';
import { z } from 'zod';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: {
    status: jest.Mock;
    send: jest.Mock;
    sent: boolean;
  };
  let mockRequest: {
    url: string;
    method: string;
  };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      sent: false,
    };

    mockRequest = {
      url: '/api/v1/test',
      method: 'POST',
    };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should format standard HttpException properly', () => {
    const exception = new NotFoundException('Resource not found');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Resource not found',
        error: 'Not Found',
        path: '/api/v1/test',
        timestamp: expect.any(String),
      }),
    );
  });

  it('should format HttpException with object response and validation array', () => {
    const exception = new BadRequestException({
      message: ['email must be an email', 'password is too short'],
      error: 'Bad Request',
    });

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        error: 'Bad Request',
        errors: ['email must be an email', 'password is too short'],
      }),
    );
  });

  it('should format ZodValidationException with structured field errors', () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
    });

    let zodError: z.ZodError | undefined;
    try {
      schema.parse({ email: 'invalid-email', age: 10 });
    } catch (err) {
      zodError = err as z.ZodError;
    }

    const exception = new ZodValidationException(zodError!);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        error: 'Bad Request',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: expect.any(String),
          }),
          expect.objectContaining({
            field: 'age',
            message: expect.any(String),
          }),
        ]),
      }),
    );
  });

  describe('Prisma error handling', () => {
    it('should format P2002 unique constraint violation as 409 Conflict', () => {
      const prismaError = {
        code: 'P2002',
        meta: { target: ['email'] },
      };

      filter.catch(prismaError, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: 'A record with this email already exists',
        }),
      );
    });

    it('should format P2025 record not found as 404 Not Found', () => {
      const prismaError = {
        code: 'P2025',
        meta: { cause: 'Record to update not found.' },
      };

      filter.catch(prismaError, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: 'Record to update not found.',
        }),
      );
    });

    it('should format P2003 foreign key violation as 400 Bad Request', () => {
      const prismaError = {
        code: 'P2003',
      };

      filter.catch(prismaError, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Foreign key constraint failed on the database',
        }),
      );
    });
  });

  describe('Unhandled generic Error handling', () => {
    it('should format generic Error with stack trace in non-production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Database connection failed unexpectedly');
      filter.catch(error, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: 'Database connection failed unexpectedly',
          stack: expect.any(String),
        }),
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should hide stack trace and return safe message in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Sensitive database credentials in error text');
      filter.catch(error, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: 'An unexpected error occurred. Please try again later.',
        }),
      );

      const sentBody = mockResponse.send.mock.calls[0][0];
      expect(sentBody.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  it('should not send response if reply has already been sent', () => {
    mockResponse.sent = true;

    filter.catch(new Error('Post-response error'), mockHost);

    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.send).not.toHaveBeenCalled();
  });
});
