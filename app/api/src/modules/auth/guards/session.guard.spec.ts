import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SessionAuthGuard } from './session.guard';

describe('SessionAuthGuard', () => {
  let guard: SessionAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new SessionAuthGuard(reflector);
  });

  const createMockContext = (session: any, isPublic: boolean): ExecutionContext => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(isPublic);

    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          session,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access if route is marked as @Public()', () => {
    const context = createMockContext(null, true);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has valid session with userId', () => {
    const context = createMockContext({ userId: 'user-123' }, false);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException if session is missing', () => {
    const context = createMockContext(null, false);
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if session has no userId', () => {
    const context = createMockContext({}, false);
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
