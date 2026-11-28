import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma, type StorageBucket, type StorageObject } from '@prisma/client';
import type { MultipartFile } from '@fastify/multipart';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateBucketDto } from './dto/create-bucket.dto';
import { UpdateBucketAccessDto } from './dto/update-bucket-access.dto';
import { UpdateStorageSettingsDto } from './dto/update-storage-settings.dto';
import { S3ObjectStore } from './s3-object.store';

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 200;
const DEFAULT_CACHE_TTL_SECONDS = 3600;

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly objectStore: S3ObjectStore,
  ) {}

  private async assertProjectOwner(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { id: true },
    });
    if (!project) throw new NotFoundException('Project not found');
  }

  private async getBucket(projectId: string, userId: string, bucketId: string) {
    await this.assertProjectOwner(projectId, userId);
    const bucket = await this.prisma.storageBucket.findFirst({
      where: { id: bucketId, projectId },
    });
    if (!bucket) throw new NotFoundException('Storage bucket not found');
    return bucket;
  }

  private presentBucket(
    bucket: StorageBucket,
    fileCount: number,
    sizeBytes: bigint,
  ) {
    return {
      id: bucket.id,
      name: bucket.name,
      access: bucket.isPublic ? ('Public' as const) : ('Private' as const),
      fileCount,
      sizeBytes: sizeBytes.toString(),
      createdAt: bucket.createdAt.toISOString(),
    };
  }

  private presentSettings(
    settings: { cdnBaseUrl: string | null; cacheTtlSeconds: number } | null,
  ) {
    return {
      cdnBaseUrl: settings?.cdnBaseUrl ?? null,
      cacheTtlSeconds:
        settings?.cacheTtlSeconds ?? DEFAULT_CACHE_TTL_SECONDS,
    };
  }

  async getSettings(projectId: string, userId: string) {
    await this.assertProjectOwner(projectId, userId);
    const settings = await this.prisma.projectStorageSettings.findUnique({
      where: { projectId },
      select: { cdnBaseUrl: true, cacheTtlSeconds: true },
    });
    return this.presentSettings(settings);
  }

  async updateSettings(
    projectId: string,
    userId: string,
    dto: UpdateStorageSettingsDto,
  ) {
    await this.assertProjectOwner(projectId, userId);
    const data = {
      ...(dto.cdnBaseUrl !== undefined
        ? {
            cdnBaseUrl:
              dto.cdnBaseUrl === null
                ? null
                : new URL(dto.cdnBaseUrl).origin,
          }
        : {}),
      ...(dto.cacheTtlSeconds !== undefined
        ? { cacheTtlSeconds: dto.cacheTtlSeconds }
        : {}),
    };
    const settings = await this.prisma.projectStorageSettings.upsert({
      where: { projectId },
      create: { projectId, ...data },
      update: data,
      select: { cdnBaseUrl: true, cacheTtlSeconds: true },
    });
    return this.presentSettings(settings);
  }

  async listBuckets(projectId: string, userId: string) {
    await this.assertProjectOwner(projectId, userId);
    const buckets = await this.prisma.storageBucket.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
    if (buckets.length === 0) return [];

    const totals = await this.prisma.storageObject.groupBy({
      by: ['bucketId'],
      where: { bucketId: { in: buckets.map((bucket) => bucket.id) } },
      _count: { _all: true },
      _sum: { size: true },
    });
    const totalByBucket = new Map(
      totals.map((row) => [
        row.bucketId,
        { count: row._count._all, size: row._sum.size ?? 0n },
      ]),
    );
    return buckets.map((bucket) => {
      const total = totalByBucket.get(bucket.id);
      return this.presentBucket(bucket, total?.count ?? 0, total?.size ?? 0n);
    });
  }

  async createBucket(projectId: string, userId: string, dto: CreateBucketDto) {
    await this.assertProjectOwner(projectId, userId);
    try {
      const bucket = await this.prisma.storageBucket.create({
        data: { projectId, name: dto.name },
      });
      return this.presentBucket(bucket, 0, 0n);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A bucket with that name already exists');
      }
      throw error;
    }
  }

  async deleteBucket(projectId: string, userId: string, bucketId: string) {
    await this.assertProjectOwner(projectId, userId);
    await this.prisma.$transaction(async (tx) => {
      const buckets = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM storage_buckets
        WHERE id = ${bucketId} AND project_id = ${projectId}
        FOR UPDATE
      `;
      if (buckets.length === 0) {
        throw new NotFoundException('Storage bucket not found');
      }
      const objectCount = await tx.storageObject.count({
        where: { bucketId },
      });
      if (objectCount > 0) {
        throw new ConflictException(
          'Delete all files in this bucket before deleting the bucket',
        );
      }
      await tx.storageBucket.delete({ where: { id: bucketId } });
    });
    return { message: 'Bucket deleted' };
  }

  async updateBucketAccess(
    projectId: string,
    userId: string,
    bucketId: string,
    dto: UpdateBucketAccessDto,
  ) {
    await this.getBucket(projectId, userId, bucketId);
    const isPublic = dto.access === 'Public';
    const result = await this.prisma.storageBucket.updateMany({
      where: { id: bucketId, projectId },
      data: { isPublic },
    });
    if (result.count === 0) {
      throw new NotFoundException('Storage bucket not found');
    }
    return { id: bucketId, access: isPublic ? 'Public' : 'Private' };
  }

  async listFiles(
    projectId: string,
    userId: string,
    bucketId: string,
    options: { cursor?: string; limit?: number; query?: string },
  ) {
    await this.getBucket(projectId, userId, bucketId);
    const limit = Math.min(
      Math.max(options.limit ?? DEFAULT_PAGE_SIZE, 1),
      MAX_PAGE_SIZE,
    );
    const query = options.query?.trim();
    const where: Prisma.StorageObjectWhereInput = {
      bucketId,
      ...(query
        ? { fileName: { contains: query, mode: 'insensitive' } }
        : {}),
    };
    const rows = await this.prisma.storageObject.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      take: limit + 1,
    });
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map((row) => this.presentFile(row));
    return {
      items,
      nextCursor: hasMore ? items.at(-1)?.id ?? null : null,
    };
  }

  private presentFile(file: StorageObject) {
    return {
      id: file.id,
      name: file.fileName,
      kind: 'file' as const,
      type: file.contentType,
      sizeBytes: file.size.toString(),
      uploadedAt: file.createdAt.toISOString(),
      owner: file.uploadedBy,
    };
  }

  async uploadFile(
    projectId: string,
    userId: string,
    bucketId: string,
    file: MultipartFile,
  ) {
    const bucket = await this.getBucket(projectId, userId, bucketId);
    const fileName = this.sanitizeFileName(file.filename);
    const contentType =
      file.mimetype.length <= 255 &&
      /^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/.test(file.mimetype)
        ? file.mimetype
        : 'application/octet-stream';
    const objectId = randomUUID();
    const objectKey = `${projectId}/${bucketId}/${objectId}`;

    let uploaded: { size: number; etag: string | null };
    try {
      uploaded = await this.objectStore.upload(objectKey, file);
    } catch (error) {
      if (file.file.truncated) {
        throw new PayloadTooLargeException('Files cannot exceed 50 MiB');
      }
      this.logger.error(
        'Object storage upload failed',
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException('File upload failed');
    }

    try {
      const now = new Date();
      const periodStart = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
      );
      const periodEnd = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
      );
      const result = await this.prisma.$transaction(async (tx) => {
        const stored = await tx.storageObject.create({
          data: {
            id: objectId,
            bucketId: bucket.id,
            objectKey,
            fileName,
            contentType,
            size: BigInt(uploaded.size),
            uploadedBy: userId,
          },
        });
        await tx.projectUsage.upsert({
          where: { projectId_periodStart: { projectId, periodStart } },
          create: {
            projectId,
            periodStart,
            periodEnd,
            fileBytes: BigInt(uploaded.size),
          },
          update: { fileBytes: { increment: BigInt(uploaded.size) } },
        });
        return stored;
      });
      return this.presentFile(result);
    } catch (error) {
      try {
        await this.objectStore.delete(objectKey);
      } catch (cleanupError) {
        this.logger.error(
          `Uploaded object ${objectKey} could not be removed after metadata persistence failed`,
          cleanupError instanceof Error ? cleanupError.stack : undefined,
        );
      }
      throw error;
    }
  }

  private sanitizeFileName(input: string) {
    const fileName = input.replaceAll('\\', '/').split('/').at(-1)?.trim();
    if (!fileName || fileName === '.' || fileName === '..') {
      throw new BadRequestException('A valid filename is required');
    }
    if (Buffer.byteLength(fileName, 'utf8') > 255) {
      throw new BadRequestException('Filename cannot exceed 255 bytes');
    }
    for (const character of fileName) {
      const codePoint = character.codePointAt(0) ?? 0;
      if (codePoint < 32 || codePoint === 127) {
        throw new BadRequestException(
          'Filename contains unsupported characters',
        );
      }
    }
    return fileName;
  }

  async getFileForDownload(
    projectId: string,
    userId: string,
    bucketId: string,
    fileId: string,
  ) {
    await this.getBucket(projectId, userId, bucketId);
    const file = await this.prisma.storageObject.findFirst({
      where: { id: fileId, bucketId },
    });
    if (!file) throw new NotFoundException('File not found');

    return {
      body: await this.objectStore.download(file.objectKey),
      fileName: file.fileName,
      contentType: file.contentType,
      size: file.size.toString(),
    };
  }

  async getPublicFileForDownload(bucketId: string, fileId: string) {
    const file = await this.prisma.storageObject.findFirst({
      where: { id: fileId, bucketId },
      include: {
        bucket: {
          select: { isPublic: true, projectId: true },
        },
      },
    });
    if (!file?.bucket.isPublic) throw new NotFoundException('File not found');

    const settings = await this.prisma.projectStorageSettings.findUnique({
      where: { projectId: file.bucket.projectId },
      select: { cacheTtlSeconds: true },
    });
    return {
      body: await this.objectStore.download(file.objectKey),
      fileName: file.fileName,
      contentType: file.contentType,
      cacheTtlSeconds:
        settings?.cacheTtlSeconds ?? DEFAULT_CACHE_TTL_SECONDS,
    };
  }

  async deleteFile(
    projectId: string,
    userId: string,
    bucketId: string,
    fileId: string,
  ) {
    await this.getBucket(projectId, userId, bucketId);
    const file = await this.prisma.storageObject.findFirst({
      where: { id: fileId, bucketId },
    });
    if (!file) throw new NotFoundException('File not found');

    await this.objectStore.delete(file.objectKey);
    const now = new Date();
    const periodStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    await this.prisma.$transaction(async (tx) => {
      await tx.storageObject.delete({ where: { id: file.id } });
      const updated = await tx.projectUsage.updateMany({
        where: {
          projectId,
          periodStart,
          fileBytes: { gte: file.size },
        },
        data: { fileBytes: { decrement: file.size } },
      });
      if (updated.count === 0) {
        await tx.projectUsage.updateMany({
          where: { projectId, periodStart },
          data: { fileBytes: 0n },
        });
      }
    });
    return { message: 'File deleted' };
  }
}
