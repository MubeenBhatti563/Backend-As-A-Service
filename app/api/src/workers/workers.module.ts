import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EMAIL_QUEUE } from './email-workers/email.constants';
import { EmailProcessor } from './email-workers/email.processor';
import { DB_QUEUE } from './db-workers/db.constants';
import { DBProcessor } from './db-workers/db.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: EMAIL_QUEUE },
      { name: DB_QUEUE },
    ),
  ],
  providers: [EmailProcessor, DBProcessor],
  exports: [EmailProcessor, DBProcessor],
})
export class WorkersModule {}
