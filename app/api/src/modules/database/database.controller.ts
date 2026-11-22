import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { DatabaseService } from './database.service';
import { CreateTableDto, InsertRowDto } from './dto/create-table.dto';

@Controller('project/:projectId/database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  getOverview(
    @Param('projectId') projectId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.getOverview(projectId, userId);
  }

  @Get('tables/:tableName')
  getTable(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @Query('page') page: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.getTable(
      projectId,
      userId,
      tableName,
      page,
      pageSize,
    );
  }

  @Post('tables')
  createTable(
    @Param('projectId') projectId: string,
    @Body() dto: CreateTableDto,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.createTable(projectId, userId, dto);
  }

  @Post('tables/:tableName/rows')
  insertRow(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @Body() dto: InsertRowDto,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.insertRow(projectId, userId, tableName, dto);
  }

  @Get('tables/:tableName/foreign-key-options/:columnName')
  getForeignKeyOptions(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @Param('columnName') columnName: string,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.getForeignKeyOptions(
      projectId,
      userId,
      tableName,
      columnName,
    );
  }
}
