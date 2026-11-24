import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { FastifyRequest } from 'fastify';
import { UsageTelemetryService } from './usage-telemetry.service';

/** Counts completed project-scoped API requests; never accepts project IDs from headers/body. */
@Injectable()
export class UsageTelemetryInterceptor implements NestInterceptor {
  constructor(private readonly telemetry: UsageTelemetryService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<FastifyRequest & { params?: { projectId?: string } }>();
    const projectId = request.params?.projectId;
    if (!projectId) return next.handle();
    return next.handle().pipe(tap({
      next: () => {
        if (context.switchToHttp().getResponse().statusCode < 400) {
          void this.telemetry.recordProjectRequest(projectId).catch(() => undefined);
        }
      },
    }));
  }
}
