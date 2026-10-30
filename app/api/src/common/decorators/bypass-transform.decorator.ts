import { SetMetadata } from '@nestjs/common';

export const BYPASS_TRANSFORM_METADATA = 'bypass_transform_metadata';

/**
 * Decorator to bypass the TransformInterceptor for routes returning raw buffers,
 * file streams, metrics, webhooks, or third-party formats.
 *
 * @example
 * ```ts
 * @BypassTransform()
 * @Get('export')
 * exportFile() { ... }
 * ```
 */
export const BypassTransform = () =>
  SetMetadata(BYPASS_TRANSFORM_METADATA, true);
