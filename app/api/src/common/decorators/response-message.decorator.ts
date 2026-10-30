import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_METADATA = 'response_message_metadata';

/**
 * Decorator to assign a custom message to the standard API response envelope.
 *
 * @example
 * ```ts
 * @ResponseMessage('User registered successfully')
 * @Post('register')
 * register(@Body() dto: RegisterDto) { ... }
 * ```
 */
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_METADATA, message);
