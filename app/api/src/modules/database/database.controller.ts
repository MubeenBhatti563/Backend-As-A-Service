import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ZodSerializerDto } from 'nestjs-zod';
import { DatabaseOverviewResponseDto } from './dto/database-response.dto';

/**
 * Database introspection endpoints for the dashboard.
 *
 * Mounted under `/api/v1/project/:id/database/*` so ownership checks stay in
 * one place (the service verifies `ownerId === session user` before touching
 * any catalog views). Session-cookie auth is enforced globally by the
 * JwtAuthGuard — nothing here is public.
 */
@Controller('project/:id/database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * GET /project/:id/database/overview
   * Returns header stats (size, table count, active connections) plus the
   * per-table list rendered by the Tables view.
   */
  @Get('overview')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(DatabaseOverviewResponseDto)
  async getOverview(
    @Param('id') projectId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.getOverview(projectId, userId);
  }

  /**
   * GET /project/:id/database/tables/:tableName
   * Single-table metadata used by the table detail page. 404s for tables that
   * do not exist inside the caller's tenant schema (no cross-tenant reads).
   */
  @Get('tables/:tableName')
  @HttpCode(HttpStatus.OK)
  async getTable(
    @Param('id') projectId: string,
    @Param('tableName') tableName: string,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.getTable(projectId, tableName, userId);
  }
}
