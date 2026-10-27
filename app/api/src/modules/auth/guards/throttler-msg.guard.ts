import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';
import { THROTTLER_MESSAGE_KEY } from '../decorators/throttler.decorator';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlerException(
    context: ExecutionContext,
  ): Promise<void> {
    const customMessage = this.reflector.getAllAndOverride<string>(
      THROTTLER_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (customMessage) {
      throw new ThrottlerException(customMessage);
    }

    throw new ThrottlerException('Too Many Requests');
  }
}
