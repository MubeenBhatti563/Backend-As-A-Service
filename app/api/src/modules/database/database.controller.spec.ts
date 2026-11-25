import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';

describe('DatabaseController', () => {
  let controller: DatabaseController;
  const databaseService = {
    getOverview: jest.fn(),
    getIndexes: jest.fn(),
    getTable: jest.fn(),
    createTable: jest.fn(),
    insertRow: jest.fn(),
    getForeignKeyOptions: jest.fn(),
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
});
