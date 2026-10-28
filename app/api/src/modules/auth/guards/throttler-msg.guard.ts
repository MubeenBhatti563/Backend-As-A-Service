import { ExecutionContext, Injectable } from '@nestjs/common';
import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerLimitDetail,
} from '@nestjs/throttler';
import { THROTTLER_MESSAGE_KEY } from '../decorators/throttler.decorator';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getErrorMessage(
    context: ExecutionContext,
    _throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<string> {
    const customMessage = this.reflector.getAllAndOverride<string>(
      THROTTLER_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    return customMessage ?? this.errorMessage;
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const message = await this.getErrorMessage(context, throttlerLimitDetail);
    throw new ThrottlerException(message);
  }
}
