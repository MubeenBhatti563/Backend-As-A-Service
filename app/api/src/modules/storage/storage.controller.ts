import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { BypassTransform } from '../../common/decorators/bypass-transform.decorator';
import { CreateBucketDto } from './dto/create-bucket.dto';
import { StorageService } from './storage.service';

function safeContentType(value: string) {
  return /^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/.test(value)
    ? value
    : 'application/octet-stream';
}

function attachmentName(value: string) {
  const encoded = encodeURIComponent(value).replace(
    /['()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `attachment; filename*=UTF-8''${encoded}`;
}

@Controller('project/:projectId/storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('buckets')
  listBuckets(
    @Param('projectId') projectId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.storageService.listBuckets(projectId, userId);
  }

  @Post('buckets')
  @HttpCode(HttpStatus.CREATED)
  createBucket(
    @Param('projectId') projectId: string,
    @GetUser('userId') userId: string,
    @Body() dto: CreateBucketDto,
  ) {
    return this.storageService.createBucket(projectId, userId, dto);
  }

  @Delete('buckets/:bucketId')
  deleteBucket(
    @Param('projectId') projectId: string,
    @Param('bucketId') bucketId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.storageService.deleteBucket(projectId, userId, bucketId);
  }

  @Get('buckets/:bucketId/files')
  listFiles(
    @Param('projectId') projectId: string,
    @Param('bucketId') bucketId: string,
    @GetUser('userId') userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('q') query?: string,
  ) {
    const parsedLimit = limit === undefined ? undefined : Number(limit);
    if (
      parsedLimit !== undefined &&
      (!Number.isInteger(parsedLimit) || parsedLimit < 1)
    ) {
      throw new BadRequestException('limit must be a positive integer');
    }
    if (cursor && !/^[0-9a-f-]{36}$/i.test(cursor)) {
      throw new BadRequestException('cursor is invalid');
    }
    if (query && query.length > 100) {
      throw new BadRequestException('q cannot exceed 100 characters');
    }
    return this.storageService.listFiles(projectId, userId, bucketId, {
      cursor,
      limit: parsedLimit,
      query,
    });
  }

  @Post('buckets/:bucketId/files')
  @HttpCode(HttpStatus.CREATED)
  async uploadFile(
    @Param('projectId') projectId: string,
    @Param('bucketId') bucketId: string,
    @GetUser('userId') userId: string,
    @Req() request: FastifyRequest,
  ) {
    const file = await request.file();
    if (!file) throw new BadRequestException('A file must be attached');
    return this.storageService.uploadFile(projectId, userId, bucketId, file);
  }

  @Get('buckets/:bucketId/files/:fileId/download')
  @BypassTransform()
  async downloadFile(
    @Param('projectId') projectId: string,
    @Param('bucketId') bucketId: string,
    @Param('fileId') fileId: string,
    @GetUser('userId') userId: string,
    @Res() reply: FastifyReply,
  ) {
    const file = await this.storageService.getFileForDownload(
      projectId,
      userId,
      bucketId,
      fileId,
    );
    return reply
      .type(safeContentType(file.contentType))
      .header('Content-Disposition', attachmentName(file.fileName))
      .header('Content-Length', file.size)
      .header('Cache-Control', 'private, no-store')
      .header('X-Content-Type-Options', 'nosniff')
      .send(file.body);
  }

  @Delete('buckets/:bucketId/files/:fileId')
  deleteFile(
    @Param('projectId') projectId: string,
    @Param('bucketId') bucketId: string,
    @Param('fileId') fileId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.storageService.deleteFile(
      projectId,
      userId,
      bucketId,
      fileId,
    );
  }
}
