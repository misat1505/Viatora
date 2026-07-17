import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { Request } from 'express';
import Redis from 'ioredis';
import { REDIS_TOKEN } from '../tokens';
import { ConfigService } from '@nestjs/config';
import { TooManyRequestsException } from '../exceptions/too-many-requests.exception';

@Injectable()
export class ThrottlerGuard implements CanActivate {
  prefix = 'api-gateway:throttler:ip';
  windowSeconds: number;
  windowMaxRequests: number;

  constructor(
    @Inject(REDIS_TOKEN) private readonly redis: Redis,
    configService: ConfigService,
  ) {
    this.windowSeconds = configService.getOrThrow<number>(
      'THROTTLING_WINDOW_SECONDS',
    );
    this.windowMaxRequests = configService.getOrThrow<number>(
      'THROTTLING_WINDOW_MAX_REQUESTS',
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { ip } = context.switchToHttp().getRequest<Request>();
    if (!ip) return false;

    const ipHash = createHash('sha256').update(ip).digest('hex');

    const redisKey = `${this.prefix}:${ipHash}`;

    const now = Date.now();
    const windowStart = now - this.windowSeconds * 1000;

    await this.redis.zremrangebyscore(redisKey, 0, windowStart);

    const count = await this.redis.zcard(redisKey);
    if (count >= this.windowMaxRequests) throw new TooManyRequestsException();

    await this.redis.zadd(redisKey, now, `${now}:${Math.random()}`);
    await this.redis.expire(redisKey, this.windowSeconds);

    return true;
  }
}
