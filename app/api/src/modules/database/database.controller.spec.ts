import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';

describe('DatabaseController', () => {
  let controller: DatabaseController;
  const databaseService = {
    getOverview: jest.fn(),
    getIndexes: jest.fn(),
    getRelationships: jest.fn(),
    getTable: jest.fn(),
    createTable: jest.fn(),
    dropTable: jest.fn(),
    insertRow: jest.fn(),
    updateRow: jest.fn(),
    deleteRow: jest.fn(),
    deleteRows: jest.fn(),
    getForeignKeyOptions: jest.fn(),
    getTableStructure: jest.fn(),
    addColumn: jest.fn(),
    dropColumn: jest.fn(),
    getTableRelationships: jest.fn(),
    getTableIndexes: jest.fn(),
    createTableIndex: jest.fn(),
    dropTableIndex: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatabaseController],
      providers: [{ provide: DatabaseService, useValue: databaseService }],
    }).compile();
    controller = module.get(DatabaseController);
  });

  it('delegates overview requests with project and caller identity', async () => {
    const overview = { stats: { totalTables: 1 }, tables: [] };
    databaseService.getOverview.mockResolvedValue(overview);
    await expect(controller.getOverview('project-1', 'user-1')).resolves.toBe(
      overview,
    );
    expect(databaseService.getOverview).toHaveBeenCalledWith(
      'project-1',
      'user-1',
    );
  });

  it('delegates index requests with project and authenticated caller identity', async () => {
    const indexes = { stats: { totalIndexes: 1 }, indexes: [] };
    databaseService.getIndexes.mockResolvedValue(indexes);

    await expect(
      controller.getIndexes('project-1', 'user-1'),
    ).resolves.toBe(indexes);
    expect(databaseService.getIndexes).toHaveBeenCalledWith(
      'project-1',
      'user-1',
    );
  });

  it('delegates relationship requests with project and authenticated caller identity', async () => {
    const relationships = { tables: [], relations: [] };
    databaseService.getRelationships.mockResolvedValue(relationships);

    await expect(
      controller.getRelationships('project-1', 'user-1'),
    ).resolves.toBe(relationships);
    expect(databaseService.getRelationships).toHaveBeenCalledWith(
      'project-1',
      'user-1',
    );
  });

  it('delegates table detail requests with pagination', async () => {
    const detail = { table: { name: 'profiles' }, rows: [] };
    databaseService.getTable.mockResolvedValue(detail);
    await expect(
      controller.getTable('project-1', 'profiles', '2', '25', 'user-1'),
    ).resolves.toBe(detail);
    expect(databaseService.getTable).toHaveBeenCalledWith(
      'project-1',
      'user-1',
      'profiles',
      '2',
      '25',
    );
  });

  it('delegates table detail requests with search filter', async () => {
    const detail = { table: { name: 'profiles' }, rows: [] };
    databaseService.getTable.mockResolvedValue(detail);
    await expect(
      controller.getTable('project-1', 'profiles', '1', '10', 'user-1', 'john'),
    ).resolves.toBe(detail);
    expect(databaseService.getTable).toHaveBeenCalledWith(
      'project-1',
      'user-1',
      'profiles',
      '1',
      '10',
      'john',
    );
  });

  it('delegates table creation with the authenticated caller', async () => {
    const dto = {
      name: 'events',
      columns: [{ name: 'payload', type: 'jsonb', nullable: true }],
    };
    const created = { name: 'events' };
    databaseService.createTable.mockResolvedValue(created);
    await expect(
      controller.createTable('project-1', dto as never, 'user-1'),
    ).resolves.toBe(created);
    expect(databaseService.createTable).toHaveBeenCalledWith(
      'project-1',
      'user-1',
      dto,
    );
  });

  it('delegates row insertion with table name, caller, and body', async () => {
    const dto = { display_name: 'Ada' };
    const inserted = { id: 'row-1' };
    databaseService.insertRow.mockResolvedValue(inserted);
    await expect(
      controller.insertRow('project-1', 'profiles', dto as never, 'user-1'),
    ).resolves.toBe(inserted);
    expect(databaseService.insertRow).toHaveBeenCalledWith(
      'project-1',
      'user-1',
      'profiles',
      dto,
    );
  });

  it('delegates dropTable requests with table name and caller identity', async () => {
    const dropped = { dropped: true, name: 'profiles' };
    databaseService.dropTable.mockResolvedValue(dropped);
    await expect(
      controller.dropTable('project-1', 'profiles', 'user-1'),
    ).resolves.toBe(dropped);
    expect(databaseService.dropTable).toHaveBeenCalledWith(
      'project-1',
      'user-1',
      'profiles',
    );
  });

  it('delegates updateRow requests with table name, rowId, caller, and body', async () => {
    const dto = { display_name: 'Ada Lovelace' };
    const updated = { updated: true };
    databaseService.updateRow.mockResolvedValue(updated);
    await expect(
      controller.updateRow('project-1', 'profiles', 'row-1', dto as never, 'user-1'),
    ).resolves.toBe(updated);
    expect(databaseService.updateRow).toHaveBeenCalledWith(
      'project-1',
      'user-1',
      'profiles',
      'row-1',
      dto,
    );
  });

  it('delegates deleteRow requests with table name, rowId, and caller', async () => {
    const deleted = { deleted: true };
    databaseService.deleteRow.mockResolvedValue(deleted);
    await expect(
      controller.deleteRow('project-1', 'profiles', 'row-1', 'user-1'),
    ).resolves.toBe(deleted);
    expect(databaseService.deleteRow).toHaveBeenCalledWith(
      'project-1',
      'user-1',
      'profiles',
      'row-1',
    );
  });

  it('delegates deleteRows requests with table name, rowIds, and caller', async () => {
    const deleted = { deleted: true, count: 2 };
    databaseService.deleteRows.mockResolvedValue(deleted);
    await expect(
      controller.deleteRows('project-1', 'profiles', { rowIds: ['row-1', 'row-2'] } as never, 'user-1'),
    ).resolves.toBe(deleted);
    expect(databaseService.deleteRows).toHaveBeenCalledWith(
      'project-1',
      'user-1',
      'profiles',
      ['row-1', 'row-2'],
    );
  });

  it('delegates foreign-key option requests with all route parameters and caller identity', async () => {
    const options = { values: ['user-1'], limit: 100 };
    databaseService.getForeignKeyOptions.mockResolvedValue(options);
    await expect(
      controller.getForeignKeyOptions(
        'project-1',
        'posts',
        'author_id',
        'user-1',
      ),
    ).resolves.toBe(options);
    expect(databaseService.getForeignKeyOptions).toHaveBeenCalledWith(
      'project-1',
      'user-1',
      'posts',
      'author_id',
    );
  });

  it('delegates getTableStructure requests with tableName and caller identity', async () => {
    const structure = { table: { name: 'posts' }, columns: [] };
    databaseService.getTableStructure.mockResolvedValue(structure);
    await expect(
      controller.getTableStructure('project-1', 'posts', 'user-1'),
    ).resolves.toBe(structure);
    expect(databaseService.getTableStructure).toHaveBeenCalledWith(
      'project-1',
      'user-1',
      'posts',
    );
  });

  it('delegates addColumn requests with tableName, DTO, and caller identity', async () => {
    const dto = { name: 'views', type: 'integer', nullable: true };
    const added = { added: true, column: 'views' };
    databaseService.addColumn.mockResolvedValue(added);
    await expect(
      controller.addColumn('project-1', 'posts', dto as never, 'user-1'),
    ).resolves.toBe(added);
    expect(databaseService.addColumn).toHaveBeenCalledWith(
      'project-1',
      'user-1',
      'posts',
      dto,
    );
  });

  it('delegates dropColumn requests with tableName, columnName, and caller identity', async () => {
    const dropped = { dropped: true, column: 'views' };
    databaseService.dropColumn.mockResolvedValue(dropped);
    await expect(
      controller.dropColumn('project-1', 'posts', 'views', 'user-1'),
    ).resolves.toBe(dropped);
    expect(databaseService.dropColumn).toHaveBeenCalledWith(
      'project-1',
      'user-1',
      'posts',
      'views',
    );
  });

  it('delegates getTableRelationships requests with tableName and caller identity', async () => {
    const rels = { table: { name: 'posts' }, relationships: [], erData: { tables: [], relations: [] } };
    databaseService.getTableRelationships.mockResolvedValue(rels);
    await expect(
      controller.getTableRelationships('project-1', 'posts', 'user-1'),
    ).resolves.toBe(rels);
    expect(databaseService.getTableRelationships).toHaveBeenCalledWith(
      'project-1',
      'user-1',
      'posts',
    );
  });

  it('delegates getTableIndexes requests with tableName and caller identity', async () => {
    const indexes = { table: { name: 'posts' }, indexes: [], stats: { totalIndexes: 0, uniqueIndexes: 0, totalSizeBytes: '0' } };
    databaseService.getTableIndexes.mockResolvedValue(indexes);
    await expect(
      controller.getTableIndexes('project-1', 'posts', 'user-1'),
    ).resolves.toBe(indexes);
    expect(databaseService.getTableIndexes).toHaveBeenCalledWith(
      'project-1',
      'user-1',
      'posts',
    );
  });

  it('delegates createTableIndex requests with tableName, DTO, and caller identity', async () => {
    const dto = { columns: ['title'], method: 'btree', isUnique: false };
    const created = { created: true, name: 'posts_title_idx' };
    databaseService.createTableIndex.mockResolvedValue(created);
    await expect(
      controller.createTableIndex('project-1', 'posts', dto as never, 'user-1'),
    ).resolves.toBe(created);
    expect(databaseService.createTableIndex).toHaveBeenCalledWith(
      'project-1',
      'user-1',
      'posts',
      dto,
    );
  });

  it('delegates dropTableIndex requests with tableName, indexName, and caller identity', async () => {
    const dropped = { dropped: true, name: 'posts_title_idx' };
    databaseService.dropTableIndex.mockResolvedValue(dropped);
    await expect(
      controller.dropTableIndex('project-1', 'posts', 'posts_title_idx', 'user-1'),
    ).resolves.toBe(dropped);
    expect(databaseService.dropTableIndex).toHaveBeenCalledWith(
      'project-1',
      'user-1',
      'posts',
      'posts_title_idx',
    );
  });
});
