import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { DB_QUEUE } from '../../workers/db-workers/db.constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: DB_QUEUE,
    }),
  ],
  providers: [ProjectService],
  controllers: [ProjectController],
})
export class ProjectModule {}
