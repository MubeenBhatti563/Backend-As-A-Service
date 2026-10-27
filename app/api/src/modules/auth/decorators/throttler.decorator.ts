import { SetMetadata } from '@nestjs/common';

export const THROTTLER_MESSAGE_KEY = 'throttlerCustomMessage';
export const ThrottlerMessage = (message: string) =>
  SetMetadata(THROTTLER_MESSAGE_KEY, message);
