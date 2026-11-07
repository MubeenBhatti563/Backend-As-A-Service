import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EMAIL_QUEUE } from './email-workers/email.constants';
import { EmailProcessor } from './email-workers/email.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: EMAIL_QUEUE,
    }),
  ],
  providers: [EmailProcessor],
  exports: [EmailProcessor],
})
export class WorkersModule {}
