import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';

/**
 * Database module — read-only introspection of per-project tenant schemas.
 * PrismaModule is global (see infra/prisma/prisma.module.ts), so the
 * PrismaService is available here without an explicit import.
 */
@Module({
  providers: [DatabaseService],
  controllers: [DatabaseController],
})
export class DatabaseModule {}
