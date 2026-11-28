import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { MultipartFile } from '@fastify/multipart';
import { Readable } from 'node:stream';
import { setTimeout as sleep } from 'node:timers/promises';

@Injectable()
export class S3ObjectStore implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(S3ObjectStore.name);
  private readonly client: S3Client;
  readonly bucket: string;

  constructor(config: ConfigService) {
    const endpoint = config.get<string>('STORAGE_ENDPOINT');
    const accessKeyId = config.get<string>('STORAGE_ACCESS_KEY_ID');
    const secretAccessKey = config.get<string>('STORAGE_SECRET_ACCESS_KEY');
    this.bucket = config.get<string>('STORAGE_BUCKET') ?? '';

    if (!accessKeyId || !secretAccessKey || !this.bucket) {
      throw new Error(
        'STORAGE_ACCESS_KEY_ID, STORAGE_SECRET_ACCESS_KEY, and STORAGE_BUCKET must be configured',
      );
    }

    this.client = new S3Client({
      endpoint,
      region: config.get<string>('STORAGE_REGION') ?? 'us-east-1',
      forcePathStyle: Boolean(endpoint),
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async onModuleInit() {
    let lastError: unknown;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      try {
        await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
        return;
      } catch (error) {
        lastError = error;
        const status = (error as { $metadata?: { httpStatusCode?: number } })
          .$metadata?.httpStatusCode;
        const name = (error as { name?: string }).name;
        if (status === 404 || name === 'NotFound' || name === 'NoSuchBucket') {
          try {
            await this.client.send(
              new CreateBucketCommand({ Bucket: this.bucket }),
            );
            return;
          } catch (createError) {
            lastError = createError;
          }
        }
        if (attempt < 7) await sleep(Math.min(250 * 2 ** attempt, 4_000));
      }
    }
    this.logger.error(
      `Unable to initialize configured object-store bucket "${this.bucket}"`,
      lastError instanceof Error ? lastError.stack : undefined,
    );
    throw new ServiceUnavailableException(
      'Object storage is unavailable or its credentials are invalid',
    );
  }

  async upload(
    objectKey: string,
    file: MultipartFile,
  ): Promise<{ size: number; etag: string | null }> {
    let size = 0;
    file.file.on('data', (chunk: Buffer | string) => {
      size += Buffer.byteLength(chunk);
    });

    try {
      const result = await new Upload({
        client: this.client,
        params: {
          Bucket: this.bucket,
          Key: objectKey,
          Body: file.file,
          ContentType: file.mimetype || 'application/octet-stream',
        },
        queueSize: 2,
        partSize: 5 * 1024 * 1024,
        leavePartsOnError: false,
      }).done();

      if (file.file.truncated) {
        throw new PayloadTooLargeException('Files cannot exceed 50 MiB');
      }

      return { size, etag: result.ETag ?? null };
    } catch (error) {
      if (file.file.truncated) {
        try {
          await this.delete(objectKey);
        } catch (cleanupError) {
          this.logger.error(
            'Unable to clean up an upload that exceeded its size limit',
            cleanupError instanceof Error ? cleanupError.stack : undefined,
          );
        }
        throw new PayloadTooLargeException('Files cannot exceed 50 MiB');
      }
      throw error;
    }
  }

  async delete(objectKey: string) {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: objectKey }),
    );
  }

  async download(objectKey: string): Promise<Readable> {
    try {
      const result = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: objectKey }),
      );
      if (!result.Body) {
        throw new InternalServerErrorException(
          'Object storage returned an empty file stream',
        );
      }
      return Readable.from(result.Body as AsyncIterable<Uint8Array>);
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error(
        'Object storage could not read the requested file',
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException('Object storage is unavailable');
    }
  }

  onModuleDestroy() {
    this.client.destroy();
  }
}
