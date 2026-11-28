import { NotFoundException } from '@nestjs/common';
import type { MultipartFile } from '@fastify/multipart';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { S3ObjectStore } from './s3-object.store';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;
  const prisma = {
    $transaction: jest.fn(),
    project: { findFirst: jest.fn() },
    storageBucket: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    storageObject: {
      groupBy: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };
  const objectStore = {
    upload: jest.fn(),
    download: jest.fn(),
    delete: jest.fn(),
  };
  const transaction = {
    storageObject: { create: jest.fn() },
    projectUsage: { upsert: jest.fn() },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.project.findFirst.mockResolvedValue({ id: 'project-1' });
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
    );
    prisma.storageBucket.findMany.mockResolvedValue([]);
    prisma.storageObject.groupBy.mockResolvedValue([]);
    service = new StorageService(
      prisma as unknown as PrismaService,
      objectStore as unknown as S3ObjectStore,
    );
  });

  it('rejects storage access when the project is not owned by the user', async () => {
    prisma.project.findFirst.mockResolvedValue(null);

    await expect(service.listBuckets('project-1', 'user-2')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.storageBucket.findMany).not.toHaveBeenCalled();
  });

  it('returns persisted buckets and their object count and byte totals', async () => {
    const createdAt = new Date('2026-11-28T12:00:00.000Z');
    prisma.storageBucket.findMany.mockResolvedValue([
      { id: 'bucket-1', projectId: 'project-1', name: 'assets', createdAt },
      { id: 'bucket-2', projectId: 'project-1', name: 'docs', createdAt },
    ]);
    prisma.storageObject.groupBy.mockResolvedValue([
      {
        bucketId: 'bucket-1',
        _count: { _all: 2 },
        _sum: { size: 125n },
      },
    ]);

    await expect(service.listBuckets('project-1', 'user-1')).resolves.toEqual([
      {
        id: 'bucket-1',
        name: 'assets',
        access: 'Private',
        fileCount: 2,
        sizeBytes: '125',
        createdAt: createdAt.toISOString(),
      },
      {
        id: 'bucket-2',
        name: 'docs',
        access: 'Private',
        fileCount: 0,
        sizeBytes: '0',
        createdAt: createdAt.toISOString(),
      },
    ]);
  });

  it('returns file metadata and a next cursor for a full page', async () => {
    const createdAt = new Date('2026-11-28T12:00:00.000Z');
    prisma.storageBucket.findFirst.mockResolvedValue({
      id: 'bucket-1',
      projectId: 'project-1',
      name: 'assets',
    });
    prisma.storageObject.findMany.mockResolvedValue(
      Array.from({ length: 3 }, (_, index) => ({
        id: `file-${index + 1}`,
        fileName: `image-${index + 1}.png`,
        contentType: 'image/png',
        size: 20n,
        uploadedBy: 'user-1',
        createdAt,
      })),
    );

    const result = await service.listFiles('project-1', 'user-1', 'bucket-1', {
      limit: 2,
      query: 'image',
    });

    expect(prisma.storageObject.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          bucketId: 'bucket-1',
          fileName: { contains: 'image', mode: 'insensitive' },
        },
        take: 3,
      }),
    );
    expect(result.items).toHaveLength(2);
    expect(result.nextCursor).toBe('file-2');
  });

  it('streams uploads under generated keys and records project file usage', async () => {
    const createdAt = new Date('2026-11-28T12:00:00.000Z');
    prisma.storageBucket.findFirst.mockResolvedValue({
      id: 'bucket-1',
      projectId: 'project-1',
      name: 'assets',
    });
    objectStore.upload.mockResolvedValue({ size: 4, etag: '"etag"' });
    transaction.storageObject.create.mockImplementation(({ data }) =>
      Promise.resolve({ ...data, createdAt }),
    );
    const file = {
      filename: '../avatar.png',
      mimetype: 'image/png',
      file: { truncated: false, on: jest.fn() },
    } as unknown as MultipartFile;

    const result = await service.uploadFile('project-1', 'user-1', 'bucket-1', file);

    expect(objectStore.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^project-1\/bucket-1\/[0-9a-f-]{36}$/),
      file,
    );
    expect(transaction.storageObject.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        bucketId: 'bucket-1',
        fileName: 'avatar.png',
        contentType: 'image/png',
        size: 4n,
        uploadedBy: 'user-1',
      }),
    });
    expect(transaction.projectUsage.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ fileBytes: 4n }),
        update: { fileBytes: { increment: 4n } },
      }),
    );
    expect(result).toMatchObject({
      name: 'avatar.png',
      type: 'image/png',
      sizeBytes: '4',
    });
  });
});
