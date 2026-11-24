import { of } from 'rxjs';
import { UsageTelemetryInterceptor } from './usage-telemetry.interceptor';

describe('UsageTelemetryInterceptor', () => {
  it('counts successful project-scoped routes, but ignores unscoped routes', async () => {
    const telemetry = { recordProjectRequest: jest.fn().mockResolvedValue(undefined) };
    const interceptor = new UsageTelemetryInterceptor(telemetry as never);
    const response = { statusCode: 200 };
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ params: { projectId: 'project-1' } }), getResponse: () => response }),
    } as never;
    interceptor.intercept(context, { handle: () => of({ ok: true }) } as never).subscribe();
    await Promise.resolve();
    expect(telemetry.recordProjectRequest).toHaveBeenCalledWith('project-1');

    telemetry.recordProjectRequest.mockClear();
    const noProject = { switchToHttp: () => ({ getRequest: () => ({ params: {} }), getResponse: () => response }) } as never;
    interceptor.intercept(noProject, { handle: () => of({ ok: true }) } as never).subscribe();
    expect(telemetry.recordProjectRequest).not.toHaveBeenCalled();
  });

  it('does not count failed responses', async () => {
    const telemetry = { recordProjectRequest: jest.fn() };
    const interceptor = new UsageTelemetryInterceptor(telemetry as never);
    const context = { switchToHttp: () => ({ getRequest: () => ({ params: { projectId: 'project-1' } }), getResponse: () => ({ statusCode: 500 }) }) } as never;
    interceptor.intercept(context, { handle: () => of({ ok: false }) } as never).subscribe();
    expect(telemetry.recordProjectRequest).not.toHaveBeenCalled();
  });
});
