import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infra/prisma/prisma.module';
import {
  PublicStorageController,
  StorageController,
} from './storage.controller';
import { StorageService } from './storage.service';
import { S3ObjectStore } from './s3-object.store';

@Module({
  imports: [PrismaModule],
  controllers: [StorageController, PublicStorageController],
  providers: [StorageService, S3ObjectStore],
})
export class StorageModule {}
