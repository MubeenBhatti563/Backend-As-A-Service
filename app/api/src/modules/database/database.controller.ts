import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { DatabaseService } from './database.service';
import {
  AddColumnDto,
  CreateIndexDto,
  CreateTableDto,
  DeleteRowsDto,
  InsertRowDto,
  AddForeignKeyDto,
  ToggleRlsDto,
  CreatePolicyDto,
} from './dto/create-table.dto';

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

  @Get('indexes')
  getIndexes(
    @Param('projectId') projectId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.getIndexes(projectId, userId);
  }

  @Get('relationships')
  getRelationships(
    @Param('projectId') projectId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.getRelationships(projectId, userId);
  }

  @Get('tables/:tableName')
  getTable(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @Query('page') page: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @GetUser('userId') userId: string,
    @Query('q') query?: string,
  ) {
    if (query !== undefined) {
      return this.databaseService.getTable(
        projectId,
        userId,
        tableName,
        page,
        pageSize,
        query,
      );
    }
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

  @Delete('tables/:tableName')
  dropTable(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.dropTable(projectId, userId, tableName);
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

  @Patch('tables/:tableName/rows/:rowId')
  updateRow(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @Param('rowId') rowId: string,
    @Body() dto: InsertRowDto,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.updateRow(
      projectId,
      userId,
      tableName,
      rowId,
      dto,
    );
  }

  @Delete('tables/:tableName/rows/:rowId')
  deleteRow(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @Param('rowId') rowId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.deleteRow(projectId, userId, tableName, rowId);
  }

  @Post('tables/:tableName/rows/delete-many')
  deleteRows(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @Body() dto: DeleteRowsDto,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.deleteRows(
      projectId,
      userId,
      tableName,
      dto.rowIds,
    );
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

  @Get('tables/:tableName/structure')
  getTableStructure(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.getTableStructure(projectId, userId, tableName);
  }

  @Post('tables/:tableName/columns')
  addColumn(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @Body() dto: AddColumnDto,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.addColumn(projectId, userId, tableName, dto);
  }

  @Delete('tables/:tableName/columns/:columnName')
  dropColumn(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @Param('columnName') columnName: string,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.dropColumn(
      projectId,
      userId,
      tableName,
      columnName,
    );
  }

  @Get('tables/:tableName/relationships')
  getTableRelationships(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.getTableRelationships(
      projectId,
      userId,
      tableName,
    );
  }

  @Post('tables/:tableName/relationships')
  addForeignKey(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @Body() dto: AddForeignKeyDto,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.addForeignKey(projectId, userId, tableName, dto);
  }

  @Get('tables/:tableName/indexes')
  getTableIndexes(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.getTableIndexes(projectId, userId, tableName);
  }

  @Post('tables/:tableName/indexes')
  createTableIndex(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @Body() dto: CreateIndexDto,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.createTableIndex(
      projectId,
      userId,
      tableName,
      dto,
    );
  }

  @Delete('tables/:tableName/indexes/:indexName')
  dropTableIndex(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @Param('indexName') indexName: string,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.dropTableIndex(
      projectId,
      userId,
      tableName,
      indexName,
    );
  }

  @Patch('tables/:tableName/rls')
  toggleTableRls(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @Body() dto: ToggleRlsDto,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.toggleTableRls(
      projectId,
      userId,
      tableName,
      dto.enabled,
    );
  }

  @Get('tables/:tableName/policies')
  getTablePolicies(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.getTablePolicies(projectId, userId, tableName);
  }

  @Post('tables/:tableName/policies')
  createTablePolicy(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @Body() dto: CreatePolicyDto,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.createTablePolicy(
      projectId,
      userId,
      tableName,
      dto,
    );
  }

  @Delete('tables/:tableName/policies/:policyName')
  dropTablePolicy(
    @Param('projectId') projectId: string,
    @Param('tableName') tableName: string,
    @Param('policyName') policyName: string,
    @GetUser('userId') userId: string,
  ) {
    return this.databaseService.dropTablePolicy(
      projectId,
      userId,
      tableName,
      policyName,
    );
  }
}
